import * as fs from 'fs/promises';
import * as path from 'path';

interface ProjectMemoryData {
    files: string[];
    decisions: Array<{
        timestamp: string;
        context: string;
        choice: string;
    }>;
    styleDNA: {
        palette?: string[];
        typography?: string;
        motionStyle?: string;
    };
    lastUpdated: number;
}

export class AgentMemory {
    private memoryDir: string;
    private dataPath: string;
    private logPath: string;
    private data: ProjectMemoryData;

    constructor(projectRoot: string) {
        this.memoryDir = path.join(projectRoot, 'memory');
        this.dataPath = path.join(this.memoryDir, 'project_data.json');
        this.logPath = path.join(this.memoryDir, 'directors_log.md');

        this.data = {
            files: [],
            decisions: [],
            styleDNA: {},
            lastUpdated: Date.now()
        };
    }

    public async initialize() {
        try {
            await fs.mkdir(this.memoryDir, { recursive: true });

            // Load Structured Data
            try {
                const content = await fs.readFile(this.dataPath, 'utf-8');
                this.data = JSON.parse(content);
            } catch {
                await this.save();
            }

            // Create Log if not exists
            try {
                await fs.access(this.logPath);
            } catch {
                await fs.writeFile(this.logPath, "# 🎬 Director's Log\nThis project starts now.\n", 'utf-8');
            }
        } catch (error) {
            console.error("Memory Init Error:", error);
        }
    }

    public async save() {
        this.data.lastUpdated = Date.now();
        await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    public async appendLog(entry: string) {
        const timestamp = new Date().toLocaleString();
        const formattedEntry = `\n### 🕒 [${timestamp}]\n${entry}\n`;
        await fs.appendFile(this.logPath, formattedEntry, 'utf-8');
    }

    public async updateDecision(context: string, choice: string) {
        this.data.decisions.push({
            timestamp: new Date().toISOString(),
            context,
            choice
        });
        await this.save();
    }

    public async trackFile(filePath: string) {
        if (!this.data.files.includes(filePath)) {
            this.data.files.push(filePath);
            await this.save();
        }
    }

    public getFiles(): string[] {
        return this.data.files;
    }

    public async getContextSummary(): Promise<string> {
        let logContent = "";
        try {
            const rawLog = await fs.readFile(this.logPath, 'utf-8');
            // Get last 1500 chars of log to keep context small but relevant
            logContent = rawLog.length > 1500 ? "..." + rawLog.slice(-1500) : rawLog;
        } catch {
            logContent = "No log entry yet.";
        }

        return `
## 🧠 PROJECT BRAIN (MEMORY)

### 📂 File Structure:
${this.data.files.length > 0 ? this.data.files.join(', ') : 'Empty project.'}

### ⚖️ Architectural Decisions:
${this.data.decisions.slice(-3).map(d => `- [${d.context}]: ${d.choice}`).join('\n') || 'None.'}

### 📝 Director's Log (Last Entries):
${logContent}
        `.trim();
    }

    public async reset() {
        this.data = {
            files: [],
            decisions: [],
            styleDNA: {},
            lastUpdated: Date.now()
        };
        await fs.rm(this.memoryDir, { recursive: true, force: true });
        await this.initialize();
    }
}
