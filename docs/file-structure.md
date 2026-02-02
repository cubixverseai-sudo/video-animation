# 📁 File Structure

> **هيكل ملفات المشروع الكامل - Monorepo Architecture**

---

## 1. نظرة عامة (Overview)

المشروع يستخدم **Monorepo** باستخدام **pnpm Workspaces** لتنظيم الكود:

```
director-agent/
├── apps/                    # التطبيقات
│   ├── web/                 # Frontend (Next.js)
│   └── server/              # Backend (Node.js)
│
├── packages/                # الحزم المشتركة
│   ├── shared/              # Types + Utils
│   ├── remotion-core/       # Remotion templates & components
│   └── ui/                  # Shared UI components
│
├── docker/                  # Docker configurations
├── docs/                    # Documentation
└── scripts/                 # Build & deployment scripts
```

---

## 2. الهيكل التفصيلي (Detailed Structure)

```
director-agent/
│
├── 📁 apps/
│   │
│   ├── 📁 web/                          # Next.js Frontend
│   │   ├── 📁 src/
│   │   │   ├── 📁 app/                  # App Router pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx             # Launchpad
│   │   │   │   ├── globals.css
│   │   │   │   │
│   │   │   │   ├── 📁 studio/
│   │   │   │   │   └── 📁 [projectId]/
│   │   │   │   │       ├── page.tsx     # Studio view
│   │   │   │   │       └── loading.tsx
│   │   │   │   │
│   │   │   │   ├── 📁 projects/
│   │   │   │   │   ├── page.tsx         # Projects list
│   │   │   │   │   └── 📁 [projectId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   └── 📁 api/              # API Routes
│   │   │   │       ├── 📁 generate/
│   │   │   │       │   └── route.ts
│   │   │   │       └── 📁 assets/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 layout/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   │
│   │   │   │   ├── 📁 launchpad/
│   │   │   │   │   ├── PromptInput.tsx
│   │   │   │   │   ├── AssetDropzone.tsx
│   │   │   │   │   ├── PresetButtons.tsx
│   │   │   │   │   ├── VoiceInput.tsx
│   │   │   │   │   └── GenerateButton.tsx
│   │   │   │   │
│   │   │   │   ├── 📁 studio/
│   │   │   │   │   ├── 📁 agent-console/
│   │   │   │   │   │   ├── ConsoleContainer.tsx
│   │   │   │   │   │   ├── StepIndicator.tsx
│   │   │   │   │   │   ├── LogStream.tsx
│   │   │   │   │   │   └── ErrorDisplay.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── 📁 live-preview/
│   │   │   │   │   │   ├── PreviewContainer.tsx
│   │   │   │   │   │   ├── RemotionPlayer.tsx
│   │   │   │   │   │   ├── TimelineBar.tsx
│   │   │   │   │   │   └── ExportButton.tsx
│   │   │   │   │   │
│   │   │   │   │   └── 📁 refinement-bar/
│   │   │   │   │       ├── RefinementInput.tsx
│   │   │   │   │       └── SuggestionChips.tsx
│   │   │   │   │
│   │   │   │   └── 📁 shared/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       ├── Card.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── Skeleton.tsx
│   │   │   │
│   │   │   ├── 📁 hooks/
│   │   │   │   ├── useSocket.ts
│   │   │   │   ├── useProject.ts
│   │   │   │   ├── useAgent.ts
│   │   │   │   └── usePreview.ts
│   │   │   │
│   │   │   ├── 📁 stores/
│   │   │   │   ├── projectStore.ts
│   │   │   │   ├── agentStore.ts
│   │   │   │   └── previewStore.ts
│   │   │   │
│   │   │   ├── 📁 lib/
│   │   │   │   ├── socket.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── animations.ts
│   │   │   │   └── utils.ts
│   │   │   │
│   │   │   └── 📁 providers/
│   │   │       ├── SocketProvider.tsx
│   │   │       ├── ThemeProvider.tsx
│   │   │       └── QueryProvider.tsx
│   │   │
│   │   ├── 📁 public/
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   │
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   │
│   └── 📁 server/                       # Node.js Backend
│       ├── 📁 src/
│       │   ├── index.ts                 # Entry point
│       │   ├── app.ts                   # Express setup
│       │   │
│       │   ├── 📁 config/
│       │   │   ├── index.ts
│       │   │   ├── database.ts
│       │   │   ├── redis.ts
│       │   │   ├── gemini.ts
│       │   │   └── remotion.ts
│       │   │
│       │   ├── 📁 api/
│       │   │   ├── 📁 routes/
│       │   │   │   ├── index.ts
│       │   │   │   ├── projects.ts
│       │   │   │   ├── generate.ts
│       │   │   │   ├── assets.ts
│       │   │   │   └── render.ts
│       │   │   │
│       │   │   ├── 📁 controllers/
│       │   │   │   ├── ProjectController.ts
│       │   │   │   ├── GenerateController.ts
│       │   │   │   ├── AssetController.ts
│       │   │   │   └── RenderController.ts
│       │   │   │
│       │   │   └── 📁 middlewares/
│       │   │       ├── auth.ts
│       │   │       ├── rateLimit.ts
│       │   │       ├── validation.ts
│       │   │       └── errorHandler.ts
│       │   │
│       │   ├── 📁 agent/
│       │   │   ├── AgentCore.ts
│       │   │   ├── AgentMemory.ts
│       │   │   ├── AgentTools.ts
│       │   │   │
│       │   │   ├── 📁 tools/
│       │   │   │   ├── 📁 architect/
│       │   │   │   │   ├── scaffoldProject.ts
│       │   │   │   │   ├── manageDependencies.ts
│       │   │   │   │   └── mapProjectAst.ts
│       │   │   │   │
│       │   │   │   ├── 📁 surgeon/
│       │   │   │   │   ├── atomicEdit.ts
│       │   │   │   │   ├── createComponent.ts
│       │   │   │   │   └── deleteFile.ts
│       │   │   │   │
│       │   │   │   ├── 📁 sensory/
│       │   │   │   │   ├── visualInspection.ts
│       │   │   │   │   └── audioAnalysis.ts
│       │   │   │   │
│       │   │   │   └── 📁 assets/
│       │   │   │       ├── generateSvg.ts
│       │   │   │       └── aiImageProxy.ts
│       │   │   │
│       │   │   ├── 📁 prompts/
│       │   │   │   ├── system.md
│       │   │   │   ├── planning.md
│       │   │   │   ├── coding.md
│       │   │   │   └── review.md
│       │   │   │
│       │   │   └── 📁 workflows/
│       │   │       ├── GenerationWorkflow.ts
│       │   │       ├── RefinementWorkflow.ts
│       │   │       └── CorrectionWorkflow.ts
│       │   │
│       │   ├── 📁 remotion/
│       │   │   ├── RemotionManager.ts
│       │   │   ├── BundlerService.ts
│       │   │   ├── RenderService.ts
│       │   │   └── PreviewServer.ts
│       │   │
│       │   ├── 📁 services/
│       │   │   ├── ProjectService.ts
│       │   │   ├── AssetService.ts
│       │   │   ├── StorageService.ts
│       │   │   └── QueueService.ts
│       │   │
│       │   ├── 📁 socket/
│       │   │   ├── SocketManager.ts
│       │   │   ├── 📁 handlers/
│       │   │   │   ├── projectHandlers.ts
│       │   │   │   └── previewHandlers.ts
│       │   │   └── events.ts
│       │   │
│       │   ├── 📁 db/
│       │   │   ├── 📁 prisma/
│       │   │   │   ├── schema.prisma
│       │   │   │   └── seed.ts
│       │   │   └── 📁 migrations/
│       │   │
│       │   ├── 📁 utils/
│       │   │   ├── logger.ts
│       │   │   ├── validators.ts
│       │   │   └── helpers.ts
│       │   │
│       │   └── 📁 types/
│       │       ├── agent.ts
│       │       ├── project.ts
│       │       ├── socket.ts
│       │       └── api.ts
│       │
│       ├── 📁 workspace/                # Agent sandbox
│       │   └── .gitkeep
│       │
│       ├── 📁 templates/                # Remotion templates
│       │   ├── 📁 basic/
│       │   ├── 📁 product-showcase/
│       │   └── 📁 explainer/
│       │
│       ├── Dockerfile
│       ├── tsconfig.json
│       └── package.json
│
│
├── 📁 packages/
│   │
│   ├── 📁 shared/                       # Shared TypeScript Types
│   │   ├── 📁 src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 types/
│   │   │   │   ├── project.ts
│   │   │   │   ├── agent.ts
│   │   │   │   ├── socket.ts
│   │   │   │   └── api.ts
│   │   │   └── 📁 utils/
│   │   │       ├── validators.ts
│   │   │       └── helpers.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── 📁 remotion-core/                # Remotion Components Library
│   │   ├── 📁 src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 compositions/
│   │   │   │   ├── BaseComposition.tsx
│   │   │   │   └── SceneWrapper.tsx
│   │   │   │
│   │   │   ├── 📁 components/
│   │   │   │   ├── Text.tsx
│   │   │   │   ├── Image.tsx
│   │   │   │   ├── Shape.tsx
│   │   │   │   └── Transition.tsx
│   │   │   │
│   │   │   ├── 📁 animations/
│   │   │   │   ├── gsap-bridge.ts
│   │   │   │   ├── presets.ts
│   │   │   │   └── easing.ts
│   │   │   │
│   │   │   └── 📁 utils/
│   │   │       ├── timing.ts
│   │   │       └── layout.ts
│   │   │
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── 📁 ui/                           # Shared UI Components
│       ├── 📁 src/
│       │   ├── index.ts
│       │   ├── 📁 components/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   └── Card.tsx
│       │   └── 📁 styles/
│       │       └── tokens.css
│       ├── tsconfig.json
│       └── package.json
│
│
├── 📁 docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.server
│   ├── Dockerfile.sandbox
│   └── docker-compose.yml
│
│
├── 📁 docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── agent-tools.md
│   └── deployment.md
│
│
├── 📁 scripts/
│   ├── setup.sh
│   ├── dev.sh
│   └── deploy.sh
│
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── ci.yml
│       └── deploy.yml
│
│
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── README.md
```

---

## 3. ملفات التكوين الرئيسية (Key Config Files)

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Root package.json

```json
{
  "name": "director-agent",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "db:migrate": "pnpm --filter server prisma migrate dev",
    "db:push": "pnpm --filter server prisma db push"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

---

## 4. متغيرات البيئة (Environment Variables)

### .env.example

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/director_agent"

# Redis
REDIS_URL="redis://localhost:6379"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Storage (S3/R2)
S3_BUCKET_NAME="director-agent-assets"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_ENDPOINT=""

# Server
PORT=4000
NODE_ENV="development"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"

```
