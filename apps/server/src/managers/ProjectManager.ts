import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const STORAGE_ROOT = path.join(process.cwd(), 'storage', 'projects');

export interface ProjectConfig {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'generating' | 'completed' | 'error';
    settings: {
        fps: number;
        duration: number;
        width: number;
        height: number;
    };
}

export interface ProjectMemory {
    working: {
        currentTask: string | null;
        openFiles: string[];
        lastError: string | null;
    };
    semantic: {
        facts: Record<string, any>;
        styleGuide: Record<string, any>;
    };
    episodic: string; // Path to markdown file
}

export class ProjectManager {

    /**
     * Creates a new isolated project with its own memory and file structure.
     */
    async createProject(name?: string, description?: string): Promise<ProjectConfig> {
        // Automatic naming if none provided (Project 1, Project 2...)
        let finalName = name;
        if (!finalName) {
            const existing = await this.listProjects();
            finalName = `Project ${existing.length + 1}`;
        }

        const id = randomUUID();
        const projectPath = path.join(STORAGE_ROOT, id);
        const projectSrc = path.join(projectPath, 'src');

        // 1. Create Empty Directory Structure
        await fs.mkdir(projectPath, { recursive: true });
        await fs.mkdir(path.join(projectPath, 'memory'), { recursive: true });

        // Asset Subdirectories
        const assetsPath = path.join(projectPath, 'assets');
        await fs.mkdir(assetsPath, { recursive: true });
        await fs.mkdir(path.join(assetsPath, 'images'), { recursive: true });
        await fs.mkdir(path.join(assetsPath, 'audio'), { recursive: true });

        await fs.mkdir(projectSrc, { recursive: true });

        // 2. Initialize Config
        const config: ProjectConfig = {
            id,
            name: finalName,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            settings: {
                fps: 30,
                duration: 150, // 5 seconds default
                width: 1920,
                height: 1080
            }
        };

        await fs.writeFile(
            path.join(projectPath, 'project.config.json'),
            JSON.stringify(config, null, 2)
        );

        // 3. Initialize Memory Pods
        await this.initializeMemory(projectPath);

        return config;
    }

    /**
     * Initializes the blank memory structures for a new project.
     */
    private async initializeMemory(projectPath: string) {
        // Working Memory
        const workingMemory = {
            currentTask: "Project initialization",
            openFiles: [],
            lastError: null
        };
        await fs.writeFile(
            path.join(projectPath, 'memory', 'working.json'),
            JSON.stringify(workingMemory, null, 2)
        );

        // Semantic Memory (Facts)
        const semanticMemory = {
            facts: {},
            styleGuide: {
                primaryColor: "#ffffff",
                font: "Inter"
            }
        };
        await fs.writeFile(
            path.join(projectPath, 'memory', 'semantic.json'),
            JSON.stringify(semanticMemory, null, 2)
        );

        // Episodic Memory (Logs)
        const initialEpisode = `# Project Log: ${new Date().toISOString()}\n\n- Project initialized successfully.\n- Memory structures created.\n`;
        await fs.writeFile(
            path.join(projectPath, 'memory', 'episodic.md'),
            initialEpisode
        );
    }

    /**
     * Retrieves a project by ID.
     */
    async getProject(id: string): Promise<ProjectConfig | null> {
        try {
            const configPath = path.join(STORAGE_ROOT, id, 'project.config.json');
            const data = await fs.readFile(configPath, 'utf-8');
            return JSON.parse(data) as ProjectConfig;
        } catch (error) {
            return null;
        }
    }

    /**
     * Lists all available projects.
     */
    async listProjects(): Promise<ProjectConfig[]> {
        try {
            await fs.mkdir(STORAGE_ROOT, { recursive: true });
            const dirs = await fs.readdir(STORAGE_ROOT);
            const projects: ProjectConfig[] = [];

            for (const dir of dirs) {
                const config = await this.getProject(dir);
                if (config) {
                    projects.push(config);
                }
            }

            // Sort by newest first
            return projects.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        } catch (error) {
            return [];
        }
    }

    /**
     * Updates project configuration.
     */
    async updateProject(id: string, updates: Partial<ProjectConfig>): Promise<ProjectConfig | null> {
        const project = await this.getProject(id);
        if (!project) return null;

        const updatedProject = {
            ...project,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await fs.writeFile(
            path.join(STORAGE_ROOT, id, 'project.config.json'),
            JSON.stringify(updatedProject, null, 2)
        );

        return updatedProject;
    }

    /**
     * Saves an uploaded file to the project's asset folder and syncs it.
     */
    async saveAsset(projectId: string, file: { buffer: Buffer, originalname: string, mimetype: string }) {
        const projectPath = path.join(STORAGE_ROOT, projectId);
        const subDir = file.mimetype.startsWith('audio') ? 'audio' : 'images';
        const targetDir = path.join(projectPath, 'assets', subDir);
        const targetPath = path.join(targetDir, file.originalname);

        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(targetPath, file.buffer);

        // Mirror to remotion-core public
        await this.syncAssetsToPublic(projectId);

        return `/assets/${projectId}/${subDir}/${file.originalname}`;
    }

    /**
     * Mirrors the project assets to BOTH remotion-core and web app public folders.
     * This is necessary because the Next.js Player uses the web app's public folder.
     */
    async syncAssetsToPublic(projectId: string) {
        const sourcePath = path.join(STORAGE_ROOT, projectId, 'assets');

        // Two destinations: Remotion core (for Remotion Studio) and Web app (for Next.js Player)
        const remotionDest = path.resolve(process.cwd(), '../../packages/remotion-core/public/assets', projectId);
        const webDest = path.resolve(process.cwd(), '../web/public/assets', projectId);

        // Helper to recursively copy directories
        const copyDir = async (src: string, dest: string) => {
            await fs.mkdir(dest, { recursive: true });
            const entries = await fs.readdir(src, { withFileTypes: true });

            for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);

                if (entry.isDirectory()) {
                    await copyDir(srcPath, destPath);
                } else {
                    await fs.copyFile(srcPath, destPath);
                }
            }
        };

        try {
            // Copy to Remotion core
            await fs.mkdir(remotionDest, { recursive: true });
            await copyDir(sourcePath, remotionDest);

            // Copy to Web app
            await fs.mkdir(webDest, { recursive: true });
            await copyDir(sourcePath, webDest);

            console.log(`✅ Assets synced for project ${projectId} to both destinations.`);
        } catch (error) {
            console.error(`Failed to sync assets for project ${projectId}:`, error);
        }
    }
}

export const projectManager = new ProjectManager();
