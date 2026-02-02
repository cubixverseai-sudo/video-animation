# 🔗 Integration & Roadmap

> **خطة التكامل وخارطة الطريق للتنفيذ**

---

## 1. خارطة الطريق (Development Roadmap)

```mermaid
gantt
    title The Director Agent - Development Timeline
    dateFormat  YYYY-MM-DD
    
    section Phase 1: Foundation
    Environment Setup       :p1a, 2024-01-01, 7d
    Database & Redis        :p1b, after p1a, 5d
    Basic API Structure     :p1c, after p1a, 7d
    
    section Phase 2: Agent Core
    Gemini Integration      :p2a, after p1c, 10d
    Tool Registry           :p2b, after p2a, 7d
    Memory System           :p2c, after p2b, 7d
    
    section Phase 3: Frontend
    Launchpad UI            :p3a, after p1c, 10d
    Studio Layout           :p3b, after p3a, 10d
    Real-time Console       :p3c, after p3b, 7d
    
    section Phase 4: Remotion
    Template System         :p4a, after p2c, 10d
    Preview Server          :p4b, after p4a, 7d
    Render Pipeline         :p4c, after p4b, 10d
    
    section Phase 5: Polish
    Self-Correction Loop    :p5a, after p4c, 10d
    Testing & QA            :p5b, after p5a, 14d
    Documentation           :p5c, after p5b, 7d
```

---

## 2. المراحل التفصيلية (Detailed Phases)

### 📦 Phase 1: Foundation (2-3 أسابيع)

#### 1.1 إعداد البيئة
```bash
# إنشاء المشروع
pnpm create turbo@latest director-agent

# تهيئة الـ Workspaces
pnpm init -w

# إضافة التطبيقات
pnpm create next-app@latest apps/web --typescript --tailwind
pnpm init apps/server
```

#### 1.2 قاعدة البيانات
- [ ] تثبيت PostgreSQL (Docker)
- [ ] تهيئة Prisma
- [ ] إنشاء الـ Schema الأولي
- [ ] تنفيذ الـ Migrations

#### 1.3 الـ Redis
- [ ] تثبيت Redis (Docker)
- [ ] تهيئة الاتصال
- [ ] إعداد BullMQ للـ Queues

#### 1.4 API الأساسي
- [ ] Express + TypeScript setup
- [ ] Middleware chain
- [ ] Error handling
- [ ] Basic routes

---

### 🧠 Phase 2: Agent Core (3-4 أسابيع)

#### 2.1 Gemini Integration
```typescript
// التكامل الأساسي
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-pro-preview',
  systemInstruction: SYSTEM_PROMPT
});
```

#### 2.2 Tool Registry
- [ ] تعريف جميع الأدوات (Tools)
- [ ] Tool execution engine
- [ ] Error handling لكل أداة
- [ ] Logging لكل استدعاء

#### 2.3 Memory System
- [ ] Short-term memory (Redis)
- [ ] Project-term memory (Redis + DB)
- [ ] Universal RAG (Vector DB)
- [ ] Context injection

---

### 🎨 Phase 3: Frontend (3-4 أسابيع)

#### 3.1 Launchpad
- [ ] PromptInput component
- [ ] AssetDropzone (drag & drop)
- [ ] PresetButtons
- [ ] VoiceInput (optional)
- [ ] GenerateButton مع loading state

#### 3.2 Studio Layout
- [ ] 3-panel layout
- [ ] Resizable panels
- [ ] Agent Console (left)
- [ ] Preview Player (center)
- [ ] Refinement Bar (bottom)

#### 3.3 Real-time Console
- [ ] WebSocket connection
- [ ] Step indicators
- [ ] Log streaming
- [ ] Error display

---

### 🎬 Phase 4: Remotion Integration (3-4 أسابيع)

#### 4.1 Template System
```typescript
// هيكل القالب
templates/
├── basic/
│   ├── src/
│   │   ├── Root.tsx
│   │   ├── Scene1.tsx
│   │   └── styles.ts
│   ├── package.json
│   └── remotion.config.ts
```

#### 4.2 Preview Server
- [ ] Remotion Studio integration
- [ ] Hot reload support
- [ ] Frame capture API
- [ ] Proxy to frontend

#### 4.3 Render Pipeline
- [ ] Local rendering
- [ ] Queue-based processing
- [ ] Progress tracking
- [ ] Output storage (S3/R2)

---

### ✨ Phase 5: Polish (2-3 أسابيع)

#### 5.1 Self-Correction Loop
- [ ] Build error detection
- [ ] Visual inspection integration
- [ ] Automatic fix attempts
- [ ] Fallback to user

#### 5.2 Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Agent behavior tests

---

## 3. خطة التكامل (Integration Plan)

### 3.1 Frontend ↔ Backend Communication

```
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   REST API                    WebSocket                          │
│   ─────────                   ─────────                          │
│   • POST /api/generate        • agent:thinking                   │
│   • GET /api/projects         • agent:step                       │
│   • POST /api/assets          • agent:log                        │
│   • GET /api/render/:id       • preview:update                   │
│                               • generation:complete              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                        ↕ HTTP / WS ↕                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      BACKEND (Node.js)                           │
│                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │ API Routes  │───►│ Controllers │───►│ Services    │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│                            │                    │                │
│                            ▼                    ▼                │
│                    ┌─────────────┐    ┌─────────────┐           │
│                    │ Agent Core  │    │ Remotion    │           │
│                    └─────────────┘    └─────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 تدفق توليد الفيديو (Generation Flow)

```typescript
// 1. Frontend يرسل الطلب
const response = await fetch('/api/generate/start', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "فيديو لإطلاق منتج",
    assets: ["logo.png"],
    preset: "product-showcase"
  })
});
const { projectId, wsUrl } = await response.json();

// 2. Frontend يتصل بـ WebSocket
const socket = io(wsUrl);
socket.on('agent:step', (step) => updateStepUI(step));
socket.on('agent:log', (log) => appendToConsole(log));
socket.on('preview:update', (frame) => updatePreview(frame));

// 3. Backend يعالج الطلب
// GenerateController.ts
async startGeneration(req, res) {
  const { prompt, assets, preset } = req.body;
  
  // Create project
  const project = await this.projectService.create({ prompt, preset });
  
  // Start agent in background
  this.queueService.add('generation', { projectId: project.id, prompt, assets });
  
  return res.json({ projectId: project.id });
}

// 4. Agent Worker يعمل
// workers/generationWorker.ts
async processJob(job) {
  const { projectId, prompt, assets } = job.data;
  
  const agent = new AgentCore({
    projectId,
    onEvent: (event) => this.broadcast(projectId, event)
  });
  
  await agent.run(prompt, assets);
}
```

### 3.3 Socket Events Reference

```typescript
// types/socket.ts

// Server → Client
interface ServerEvents {
  // Agent state
  'agent:thinking': { message: string };
  'agent:step': { 
    step: number; 
    name: string; 
    status: 'pending' | 'active' | 'complete' | 'error' 
  };
  'agent:log': { 
    type: 'info' | 'code' | 'warn' | 'error'; 
    message: string;
    file?: string;
    line?: number;
  };
  'agent:tool': { 
    tool: string; 
    args: Record<string, any>;
    result?: any;
  };
  
  // Preview
  'preview:frame': { frameNumber: number; url: string };
  'preview:ready': { previewUrl: string };
  
  // Completion
  'generation:complete': { videoUrl: string; duration: number };
  'generation:error': { error: string; recoverable: boolean };
}

// Client → Server
interface ClientEvents {
  'project:refine': { projectId: string; instruction: string };
  'project:cancel': { projectId: string };
  'preview:seek': { frame: number };
}
```

---

## 4. متطلبات البنية التحتية (Infrastructure)

### 4.1 Development

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: director_agent
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://server:4000
    depends_on:
      - server

  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://dev:dev123@postgres:5432/director_agent
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 4.2 Production

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFlare                               │
│                           (CDN)                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     Load Balancer                                │
│                   (Nginx / Traefik)                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                      │
┌────────▼────────┐                  ┌─────────▼─────────┐
│   Web Servers   │                  │   API Servers     │
│  (Next.js SSR)  │                  │  (Node.js + WS)   │
│   × 2-3 nodes   │                  │    × 2-4 nodes    │
└────────┬────────┘                  └─────────┬─────────┘
         │                                      │
         │         ┌────────────────────┐       │
         │         │   Message Queue    │       │
         │         │     (BullMQ)       │◄──────┤
         │         └─────────┬──────────┘       │
         │                   │                  │
         │         ┌─────────▼──────────┐       │
         │         │   Render Workers   │       │
         │         │    × 4-10 VMs      │       │
         │         └─────────┬──────────┘       │
         │                   │                  │
┌────────▼───────────────────▼──────────────────▼────────┐
│                    Databases                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │  S3 / R2     │  │
│  │  (Primary)   │  │   (Cache)    │  │  (Storage)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. معايير القبول (Acceptance Criteria)

### ✅ Phase 1 Complete
- [ ] يمكن الوصول للـ API على `localhost:4000`
- [ ] قاعدة البيانات تعمل وتقبل الاتصالات
- [ ] Redis يعمل للـ Caching

### ✅ Phase 2 Complete
- [ ] الوكيل يفهم الـ Prompts ويرد بشكل منطقي
- [ ] جميع الأدوات (Tools) قابلة للتنفيذ
- [ ] الذاكرة تحفظ السياق بين الطلبات

### ✅ Phase 3 Complete
- [ ] الـ Launchpad يعمل ويقبل المدخلات
- [ ] الاستوديو يعرض الـ 3 أقسام
- [ ] الـ Console يعرض الـ Logs في الوقت الحقيقي

### ✅ Phase 4 Complete
- [ ] القوالب تُنشأ بنجاح
- [ ] المعاينة الحية تعمل
- [ ] الرندر ينتج فيديو قابل للتحميل

### ✅ Phase 5 Complete
- [ ] التصحيح الذاتي يعمل (كود + بصري)
- [ ] الاختبارات تغطي 80%+ من الكود
- [ ] التوثيق مكتمل

---

## 6. المخاطر والتخفيف (Risks & Mitigation)

| المخاطر | الاحتمال | التأثير | التخفيف |
|---------|---------|--------|---------|
| Gemini API rate limits | متوسط | عالي | تنفيذ retry with backoff + caching |
| Remotion rendering بطيء | عالي | متوسط | استخدام Remotion Lambda للتوزيع |
| تكلفة AI عالية | متوسط | عالي | تحسين الـ prompts + context caching |
| تعقيد self-correction | عالي | عالي | البدء بنسخة بسيطة ثم التطوير |
