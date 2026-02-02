# 🔧 Backend Architecture

> **هندسة الخادم والوكيل - The Director Agent**

---

## 1. التقنيات المعتمدة (Tech Stack)

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Node.js | 20.x LTS | Runtime |
| Express.js | 5.x | HTTP Server |
| TypeScript | 5.x | Type Safety |
| Socket.io | 4.x | Real-time Communication |
| Prisma | 5.x | ORM |
| PostgreSQL | 16.x | Primary Database |
| Redis | 7.x | Cache + Queue |
| BullMQ | 5.x | Job Queue |
| Docker | Latest | Containerization |
| Gemini SDK | Latest | AI Agent Core |

---

## 2. هيكل الخادم (Server Structure)

```
server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Express app configuration
│   │
│   ├── config/
│   │   ├── index.ts                # Configuration aggregator
│   │   ├── database.ts             # DB connection config
│   │   ├── redis.ts                # Redis config
│   │   ├── gemini.ts               # Gemini API config
│   │   └── remotion.ts             # Remotion config
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── index.ts            # Route aggregator
│   │   │   ├── projects.ts         # /api/projects
│   │   │   ├── generate.ts         # /api/generate
│   │   │   ├── assets.ts           # /api/assets
│   │   │   └── render.ts           # /api/render
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.ts             # Authentication
│   │   │   ├── rateLimit.ts        # Rate limiting
│   │   │   ├── validation.ts       # Request validation
│   │   │   └── errorHandler.ts     # Global error handler
│   │   │
│   │   └── controllers/
│   │       ├── ProjectController.ts
│   │       ├── GenerateController.ts
│   │       ├── AssetController.ts
│   │       └── RenderController.ts
│   │
│   ├── agent/
│   │   ├── AgentCore.ts            # Main agent orchestrator
│   │   ├── AgentMemory.ts          # Memory management
│   │   ├── AgentTools.ts           # Tool registry
│   │   │
│   │   ├── tools/
│   │   │   ├── architect/
│   │   │   │   ├── scaffoldProject.ts
│   │   │   │   ├── manageDependencies.ts
│   │   │   │   └── mapProjectAst.ts
│   │   │   │
│   │   │   ├── surgeon/
│   │   │   │   ├── atomicEdit.ts
│   │   │   │   ├── createComponent.ts
│   │   │   │   └── deleteFile.ts
│   │   │   │
│   │   │   ├── sensory/
│   │   │   │   ├── visualInspection.ts
│   │   │   │   └── audioAnalysis.ts
│   │   │   │
│   │   │   └── assets/
│   │   │       ├── generateSvg.ts
│   │   │       └── aiImageProxy.ts
│   │   │
│   │   ├── prompts/
│   │   │   ├── system.md           # System instructions
│   │   │   ├── planning.md         # Planning phase prompt
│   │   │   ├── coding.md           # Coding phase prompt
│   │   │   └── review.md           # Review phase prompt
│   │   │
│   │   └── workflows/
│   │       ├── GenerationWorkflow.ts
│   │       ├── RefinementWorkflow.ts
│   │       └── CorrectionWorkflow.ts
│   │
│   ├── remotion/
│   │   ├── RemotionManager.ts      # Remotion project manager
│   │   ├── BundlerService.ts       # Build service
│   │   ├── RenderService.ts        # Render service
│   │   └── PreviewServer.ts        # Dev server for preview
│   │
│   ├── services/
│   │   ├── ProjectService.ts
│   │   ├── AssetService.ts
│   │   ├── StorageService.ts       # S3/R2 integration
│   │   └── QueueService.ts         # BullMQ jobs
│   │
│   ├── socket/
│   │   ├── SocketManager.ts        # Socket.io setup
│   │   ├── handlers/
│   │   │   ├── projectHandlers.ts
│   │   │   └── previewHandlers.ts
│   │   └── events.ts               # Event type definitions
│   │
│   ├── db/
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Database schema
│   │   └── migrations/             # DB migrations
│   │
│   ├── utils/
│   │   ├── logger.ts               # Winston logger
│   │   ├── validators.ts           # Zod schemas
│   │   └── helpers.ts              # Utility functions
│   │
│   └── types/
│       ├── agent.ts                # Agent types
│       ├── project.ts              # Project types
│       ├── socket.ts               # Socket event types
│       └── api.ts                  # API request/response types
│
├── workspace/                      # Agent workspace (sandboxed)
│   └── [projectId]/               # Per-project directories
│
├── templates/                      # Remotion project templates
│   ├── basic/
│   ├── product-showcase/
│   └── explainer/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 3. الـ API Endpoints

### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | قائمة مشاريع المستخدم |
| POST | `/api/projects` | إنشاء مشروع جديد |
| GET | `/api/projects/:id` | تفاصيل مشروع |
| DELETE | `/api/projects/:id` | حذف مشروع |
| PATCH | `/api/projects/:id` | تحديث اسم/إعدادات المشروع |

### Generation API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/start` | بدء عملية التوليد |
| POST | `/api/generate/refine` | إرسال تعديل للوكيل |
| POST | `/api/generate/cancel` | إلغاء التوليد |
| GET | `/api/generate/:id/status` | حالة التوليد |

### Assets API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assets/upload` | رفع ملف (صورة/صوت/شعار) |
| GET | `/api/assets/:id` | الحصول على ملف |
| DELETE | `/api/assets/:id` | حذف ملف |

### Render API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/render/start` | بدء الرندر النهائي |
| GET | `/api/render/:id/status` | حالة الرندر |
| GET | `/api/render/:id/download` | تحميل الفيديو النهائي |

---

## 4. نظام الوكيل (Agent System)

### Agent Core Architecture

```typescript
// agent/AgentCore.ts

interface AgentConfig {
  model: 'gemini-2.5-pro-preview';
  systemInstruction: string;
  tools: Tool[];
  memoryLayers: MemoryConfig;
}

class AgentCore {
  private gemini: GoogleGenerativeAI;
  private memory: AgentMemory;
  private tools: ToolRegistry;
  private projectPath: string;
  
  async run(prompt: string, onEvent: EventCallback): Promise<AgentResult> {
    // 1. Load context from memory
    const context = await this.memory.getContext();
    
    // 2. Execute agent loop
    while (!completed) {
      const response = await this.gemini.generateContent({
        contents: [...context, { role: 'user', parts: [{ text: prompt }] }],
        tools: this.tools.getDeclarations(),
      });
      
      // 3. Process function calls
      for (const call of response.functionCalls) {
        const result = await this.tools.execute(call.name, call.args);
        onEvent({ type: 'tool_result', tool: call.name, result });
      }
      
      // 4. Self-correction check
      if (await this.needsCorrection()) {
        await this.runCorrectionLoop();
      }
    }
    
    return { success: true, projectPath: this.projectPath };
  }
}
```

### Tool Definitions (Function Calling)

```typescript
// agent/tools/definitions.ts

export const agentTools: Tool[] = [
  // === ARCHITECT TOOLS ===
  {
    name: 'scaffold_project',
    description: 'Create a new Remotion project structure from template',
    parameters: {
      type: 'object',
      properties: {
        templateName: { type: 'string', enum: ['basic', 'product', 'explainer'] },
        projectName: { type: 'string' },
        fps: { type: 'number', default: 30 },
        width: { type: 'number', default: 1920 },
        height: { type: 'number', default: 1080 },
      },
      required: ['templateName', 'projectName']
    }
  },
  
  {
    name: 'manage_dependencies',
    description: 'Install or remove NPM packages in the project',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['install', 'remove'] },
        packages: { type: 'array', items: { type: 'string' } }
      },
      required: ['action', 'packages']
    }
  },
  
  {
    name: 'map_project_ast',
    description: 'Get the Abstract Syntax Tree and file structure of the project',
    parameters: {
      type: 'object',
      properties: {
        includeNodeModules: { type: 'boolean', default: false }
      }
    }
  },
  
  // === SURGEON TOOLS ===
  {
    name: 'atomic_edit',
    description: 'Make precise edits to specific lines in a file',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string' },
        edits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              startLine: { type: 'number' },
              endLine: { type: 'number' },
              newContent: { type: 'string' }
            }
          }
        }
      },
      required: ['filePath', 'edits']
    }
  },
  
  {
    name: 'create_component',
    description: 'Create a new React/Remotion component file',
    parameters: {
      type: 'object',
      properties: {
        componentName: { type: 'string' },
        componentType: { type: 'string', enum: ['scene', 'element', 'overlay'] },
        code: { type: 'string' },
        gsapAnimations: { type: 'boolean', default: true }
      },
      required: ['componentName', 'componentType', 'code']
    }
  },
  
  // === SENSORY TOOLS ===
  {
    name: 'visual_frame_inspection',
    description: 'Capture a frame at specific time and analyze it visually',
    parameters: {
      type: 'object',
      properties: {
        frameNumber: { type: 'number' },
        analysisPrompt: { type: 'string' }
      },
      required: ['frameNumber']
    }
  },
  
  {
    name: 'audio_spectrum_analysis',
    description: 'Analyze audio file and extract beat markers for sync',
    parameters: {
      type: 'object',
      properties: {
        audioFilePath: { type: 'string' },
        sensitivity: { type: 'number', default: 0.5 }
      },
      required: ['audioFilePath']
    }
  },
  
  // === ASSET TOOLS ===
  {
    name: 'generate_svg_asset',
    description: 'Generate SVG code for icons and shapes',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        style: { type: 'string', enum: ['flat', 'outlined', 'filled', 'gradient'] },
        colors: { type: 'array', items: { type: 'string' } }
      },
      required: ['description']
    }
  },
  
  {
    name: 'ai_image_proxy',
    description: 'Request AI-generated image for backgrounds or elements',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        aspectRatio: { type: 'string', enum: ['16:9', '9:16', '1:1', '4:3'] },
        style: { type: 'string' }
      },
      required: ['prompt']
    }
  },
  
  // === PROJECT TOOLS ===
  {
    name: 'run_preview',
    description: 'Start the Remotion preview server and get preview URL',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  
  {
    name: 'run_build_check',
    description: 'Run TypeScript compilation check and return errors',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  
  {
    name: 'save_version',
    description: 'Save current state as a version for undo capability',
    parameters: {
      type: 'object',
      properties: {
        label: { type: 'string' }
      }
    }
  },
  
  {
    name: 'restore_version',
    description: 'Restore project to a previously saved version',
    parameters: {
      type: 'object',
      properties: {
        versionId: { type: 'string' }
      },
      required: ['versionId']
    }
  }
];
```

---

## 5. نظام الذاكرة (Memory System)

```typescript
// agent/AgentMemory.ts

interface MemoryLayers {
  shortTerm: ShortTermMemory;   // Current conversation
  projectTerm: ProjectMemory;   // Project-specific rules
  universal: UniversalMemory;   // RAG knowledge base
}

class AgentMemory {
  private redis: Redis;
  private vectorDb: Pinecone;
  
  // Short-term: Current session context
  async getShortTermContext(sessionId: string): Promise<Message[]> {
    return await this.redis.lrange(`session:${sessionId}`, 0, -1);
  }
  
  // Project-term: Design decisions made for this project
  async getProjectContext(projectId: string): Promise<ProjectContext> {
    return {
      colorPalette: await this.redis.hget(`project:${projectId}`, 'colors'),
      fonts: await this.redis.hget(`project:${projectId}`, 'fonts'),
      style: await this.redis.hget(`project:${projectId}`, 'style'),
      decisions: await this.redis.lrange(`project:${projectId}:decisions`, 0, -1)
    };
  }
  
  // Universal: RAG for GSAP/Remotion best practices
  async queryKnowledge(query: string): Promise<string[]> {
    const embedding = await this.getEmbedding(query);
    const results = await this.vectorDb.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true
    });
    return results.matches.map(m => m.metadata.content);
  }
}
```

---

## 6. Sandbox Execution Environment

```typescript
// remotion/SandboxManager.ts

class SandboxManager {
  private docker: Docker;
  
  async createWorkspace(projectId: string): Promise<Workspace> {
    // Create isolated container
    const container = await this.docker.createContainer({
      Image: 'director-agent-sandbox:latest',
      Volumes: {
        '/workspace': {}
      },
      HostConfig: {
        Memory: 2 * 1024 * 1024 * 1024, // 2GB limit
        CpuQuota: 100000, // 1 CPU
        NetworkMode: 'none' // No network access
      }
    });
    
    await container.start();
    
    return {
      containerId: container.id,
      workspacePath: `/workspace/${projectId}`,
      exec: (cmd: string) => this.executeInContainer(container, cmd)
    };
  }
  
  async executeInContainer(container: Container, command: string): Promise<ExecResult> {
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true
    });
    
    return await exec.start();
  }
}
```

---

## 7. Queue System (Background Jobs)

```typescript
// services/QueueService.ts

import { Queue, Worker } from 'bullmq';

// Define queues
const renderQueue = new Queue('render', { connection: redis });
const analysisQueue = new Queue('analysis', { connection: redis });

// Render worker
new Worker('render', async (job) => {
  const { projectId, compositionId, outputPath } = job.data;
  
  await job.updateProgress(0);
  
  const result = await renderMedia({
    composition: compositionId,
    outputLocation: outputPath,
    onProgress: (p) => job.updateProgress(p.progress * 100)
  });
  
  return { videoUrl: result.outputPath };
}, { connection: redis });

// Audio analysis worker
new Worker('analysis', async (job) => {
  const { audioPath } = job.data;
  
  const beats = await analyzeAudio(audioPath);
  
  return { beats };
}, { connection: redis });
```

---

## 8. Database Schema

```prisma
// db/prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  name        String
  status      ProjectStatus @default(DRAFT)
  prompt      String   @db.Text
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  assets      Asset[]
  versions    ProjectVersion[]
  renders     Render[]
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProjectStatus {
  DRAFT
  GENERATING
  READY
  RENDERING
  COMPLETED
  ERROR
}

model Asset {
  id        String   @id @default(cuid())
  name      String
  type      AssetType
  url       String
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
}

enum AssetType {
  IMAGE
  AUDIO
  VIDEO
  SVG
  FONT
}

model ProjectVersion {
  id        String   @id @default(cuid())
  label     String?
  snapshot  Json     // Full project state
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
}

model Render {
  id        String   @id @default(cuid())
  status    RenderStatus @default(QUEUED)
  progress  Float    @default(0)
  videoUrl  String?
  duration  Float?
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum RenderStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 9. Event Streaming (Server-Sent Events)

```typescript
// api/routes/generate.ts

router.get('/api/generate/:id/stream', async (req, res) => {
  const { id } = req.params;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const subscriber = new Redis(redisConfig);
  
  await subscriber.subscribe(`agent:${id}`);
  
  subscriber.on('message', (channel, message) => {
    const event = JSON.parse(message);
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  });
  
  req.on('close', () => {
    subscriber.unsubscribe();
    subscriber.quit();
  });
});
```
