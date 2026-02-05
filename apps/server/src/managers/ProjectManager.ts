import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Single source of truth: root /projects folder
const PROJECTS_ROOT = path.resolve(process.cwd(), '../../projects');

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
        const projectPath = path.join(PROJECTS_ROOT, id);

        // 1. Create Directory Structure (simplified - single source of truth)
        await fs.mkdir(projectPath, { recursive: true });
        await fs.mkdir(path.join(projectPath, 'memory'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'assets', 'images'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'assets', 'audio'), { recursive: true });

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
            path.join(projectPath, 'config.json'),
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
            const configPath = path.join(PROJECTS_ROOT, id, 'config.json');
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
            await fs.mkdir(PROJECTS_ROOT, { recursive: true });
            const dirs = await fs.readdir(PROJECTS_ROOT);
            const projects: ProjectConfig[] = [];

            for (const dir of dirs) {
                // Skip hidden files and .gitkeep
                if (dir.startsWith('.')) continue;
                
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
            path.join(PROJECTS_ROOT, id, 'config.json'),
            JSON.stringify(updatedProject, null, 2)
        );

        return updatedProject;
    }

    /**
     * Saves an uploaded file to the project's asset folder.
     * No sync needed - assets are served directly from /projects folder.
     */
    async saveAsset(projectId: string, file: { buffer: Buffer, originalname: string, mimetype: string }) {
        const projectPath = path.join(PROJECTS_ROOT, projectId);
        const subDir = file.mimetype.startsWith('audio') ? 'audio' : 'images';
        const targetDir = path.join(projectPath, 'assets', subDir);
        const targetPath = path.join(targetDir, file.originalname);

        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(targetPath, file.buffer);

        // Return the public path for serving via Express
        return `/assets/${projectId}/assets/${subDir}/${file.originalname}`;
    }

    /**
     * Deletes a project and all its files.
     */
    async deleteProject(id: string): Promise<boolean> {
        try {
            const projectPath = path.join(PROJECTS_ROOT, id);
            await fs.rm(projectPath, { recursive: true, force: true });
            return true;
        } catch (error) {
            console.error(`Failed to delete project ${id}:`, error);
            return false;
        }
    }

    /**
     * Gets the full path to a project folder.
     */
    getProjectPath(id: string): string {
        return path.join(PROJECTS_ROOT, id);
    }

    /**
     * Gets the PLAN.md content for a project.
     * Returns null if no plan exists.
     */
    async getProjectPlan(id: string): Promise<string | null> {
        try {
            const planPath = path.join(PROJECTS_ROOT, id, 'PLAN.md');
            const content = await fs.readFile(planPath, 'utf-8');
            return content;
        } catch (error) {
            return null;
        }
    }
}

export const projectManager = new ProjectManager();
