# 🎨 Frontend Architecture

> **هندسة واجهة المستخدم - The Director Agent**

---

## 1. التقنيات المعتمدة (Tech Stack)

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Next.js | 15.x | Framework + App Router |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Shadcn UI | Latest | Component Library |
| Framer Motion | 11.x | UI Animations |
| Socket.io Client | 4.x | Real-time Communication |
| Zustand | 5.x | State Management |
| React Query | 5.x | Server State |

---

## 2. تصميم الواجهة ثنائي المراحل (Dual-Stage UI)

### المرحلة الأولى: منطقة الهبوط (The Launchpad)

```
┌─────────────────────────────────────────────────────────────┐
│                        Header (Logo)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│              ┌─────────────────────────────┐                │
│              │    🎬 Director Agent        │                │
│              │                             │                │
│              │  ┌───────────────────────┐  │                │
│              │  │ صف فيديو أحلامك...    │  │                │
│              │  └───────────────────────┘  │                │
│              │                             │                │
│              │  ┌─────────────────────┐    │                │
│              │  │  📁 ارفع الأصول    │    │                │
│              │  │   Drag & Drop      │    │                │
│              │  └─────────────────────┘    │                │
│              │                             │                │
│              │  [منتج] [شرح] [هادئ] [سريع]│                │
│              │                             │                │
│              │     [ 🚀 Generate ]         │                │
│              └─────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### المرحلة الثانية: استوديو الإخراج (The Agentic Studio)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]                              Project: "Product Launch"    [Settings] │
├───────────────────┬─────────────────────────────────────────────────────────┤
│                   │                                                          │
│  🤖 Agent Console │              🎬 Live Preview Stage                       │
│                   │                                                          │
│  ┌─────────────┐  │     ┌────────────────────────────────────┐              │
│  │ ● Analyzing │  │     │                                    │              │
│  │ ✓ Scaffolding│  │     │      [Remotion Player]            │              │
│  │ ◐ Coding... │  │     │                                    │              │
│  └─────────────┘  │     │         🎥 Video Preview            │              │
│                   │     │                                    │              │
│  ─────────────────│     └────────────────────────────────────┘              │
│                   │                                                          │
│  > Creating       │     ┌────────────────────────────────────┐              │
│    Scene1.tsx     │     │ ◀ ▶ ◼                    00:05/00:30 │              │
│                   │     └────────────────────────────────────┘              │
│  > Editing line 42│                                                          │
│    in styles.ts   │                                                          │
│                   │                                                          │
│  ⚠ Fixed overflow │                                                          │
│    issue          │                                                          │
│                   │                                                          │
├───────────────────┴─────────────────────────────────────────────────────────┤
│  💬 Refinement Bar                                                           │
│  ┌─────────────────────────────────────────────────────────────┐  [Send]    │
│  │ أضف اهتزازاً للشعار عند الثانية 3...                        │            │
│  └─────────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. هيكل المكونات (Component Structure)

```
components/
├── layout/
│   ├── Header.tsx              # الشريط العلوي
│   ├── Sidebar.tsx             # القائمة الجانبية (للمشاريع)
│   └── Footer.tsx              # الشريط السفلي
│
├── launchpad/
│   ├── PromptInput.tsx         # حقل الإدخال الذكي
│   ├── AssetDropzone.tsx       # منطقة رفع الملفات
│   ├── PresetButtons.tsx       # أزرار النماذج السريعة
│   ├── VoiceInput.tsx          # الإدخال الصوتي
│   └── GenerateButton.tsx      # زر التوليد الرئيسي
│
├── studio/
│   ├── AgentConsole/
│   │   ├── ConsoleContainer.tsx
│   │   ├── StepIndicator.tsx   # مؤشر المراحل
│   │   ├── LogStream.tsx       # سجل الأوامر الحي
│   │   └── ErrorDisplay.tsx    # عرض الأخطاء
│   │
│   ├── LivePreview/
│   │   ├── PreviewContainer.tsx
│   │   ├── RemotionPlayer.tsx  # مشغل Remotion
│   │   ├── TimelineBar.tsx     # شريط التحكم الزمني
│   │   └── ExportButton.tsx    # زر التصدير
│   │
│   └── RefinementBar/
│       ├── RefinementInput.tsx # حقل التعديلات
│       └── SuggestionChips.tsx # اقتراحات سريعة
│
├── shared/
│   ├── Button.tsx              # زر موحد
│   ├── Input.tsx               # حقل إدخال موحد
│   ├── Card.tsx                # بطاقة موحدة
│   ├── Modal.tsx               # نافذة منبثقة
│   ├── Tooltip.tsx             # تلميح
│   └── Skeleton.tsx            # هيكل التحميل
│
└── providers/
    ├── SocketProvider.tsx      # موفر الاتصال الحي
    ├── ThemeProvider.tsx       # موفر السمة
    └── QueryProvider.tsx       # موفر React Query
```

---

## 4. إدارة الحالة (State Management)

### Zustand Stores

```typescript
// stores/projectStore.ts
interface ProjectState {
  projectId: string | null;
  projectName: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  assets: Asset[];
  timeline: TimelineItem[];
  
  // Actions
  setProject: (id: string, name: string) => void;
  addAsset: (asset: Asset) => void;
  updateStatus: (status: ProjectState['status']) => void;
}

// stores/agentStore.ts
interface AgentState {
  isThinking: boolean;
  currentStep: number;
  steps: AgentStep[];
  logs: LogEntry[];
  errors: ErrorEntry[];
  
  // Actions
  addLog: (log: LogEntry) => void;
  setStep: (step: number) => void;
  addError: (error: ErrorEntry) => void;
}

// stores/previewStore.ts
interface PreviewState {
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  previewUrl: string | null;
  
  // Actions
  play: () => void;
  pause: () => void;
  seekTo: (frame: number) => void;
  setPreviewUrl: (url: string) => void;
}
```

---

## 5. التواصل في الوقت الفعلي (Real-time Communication)

### Socket Events

```typescript
// types/socket.ts

// Server → Client Events
interface ServerToClientEvents {
  // Agent Logs
  'agent:thinking': (data: { message: string }) => void;
  'agent:step': (data: { step: number; name: string; status: string }) => void;
  'agent:log': (data: { type: 'info' | 'warn' | 'error'; message: string }) => void;
  'agent:code': (data: { file: string; line: number; action: string }) => void;
  
  // Preview Updates
  'preview:update': (data: { frameUrl: string }) => void;
  'preview:ready': (data: { projectPath: string }) => void;
  
  // Completion
  'generation:complete': (data: { videoUrl: string; duration: number }) => void;
  'generation:error': (data: { error: string; recoverable: boolean }) => void;
}

// Client → Server Events
interface ClientToServerEvents {
  'project:start': (data: { prompt: string; assets: string[] }) => void;
  'project:refine': (data: { projectId: string; instruction: string }) => void;
  'project:cancel': (data: { projectId: string }) => void;
  'preview:seek': (data: { frame: number }) => void;
}
```

---

## 6. الصفحات والتوجيه (Pages & Routing)

```
app/
├── layout.tsx                 # Layout الرئيسي
├── page.tsx                   # الصفحة الرئيسية (Launchpad)
├── globals.css                # Tailwind + Custom CSS
│
├── studio/
│   └── [projectId]/
│       ├── page.tsx           # صفحة الاستوديو
│       └── loading.tsx        # حالة التحميل
│
├── projects/
│   ├── page.tsx               # قائمة المشاريع
│   └── [projectId]/
│       └── page.tsx           # تفاصيل المشروع
│
├── settings/
│   └── page.tsx               # الإعدادات
│
└── api/
    ├── generate/
    │   └── route.ts           # بدء التوليد
    ├── projects/
    │   └── route.ts           # إدارة المشاريع
    └── assets/
        └── upload/
            └── route.ts       # رفع الأصول
```

---

## 7. نظام التصميم (Design System)

### Color Palette (Dark Mode First)

```css
:root {
  /* Background */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a25;
  
  /* Accent */
  --accent-primary: #6366f1;   /* Indigo */
  --accent-secondary: #8b5cf6; /* Violet */
  --accent-glow: rgba(99, 102, 241, 0.2);
  
  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Status */
  --status-success: #22c55e;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
  --status-info: #3b82f6;
  
  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-visible: rgba(255, 255, 255, 0.15);
}
```

### Typography

```css
/* Headings */
--font-display: 'Cal Sans', 'Inter', sans-serif;

/* Body */
--font-body: 'Inter', sans-serif;

/* Code/Mono */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Glassmorphism Effects

```css
.glass-card {
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.glow-effect {
  box-shadow: 
    0 0 20px var(--accent-glow),
    0 0 40px var(--accent-glow);
}
```

---

## 8. الحركات والانتقالات (Animations)

### Framer Motion Variants

```typescript
// lib/animations.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(99, 102, 241, 0.2)',
      '0 0 40px rgba(99, 102, 241, 0.4)',
      '0 0 20px rgba(99, 102, 241, 0.2)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};

export const typewriter = {
  animate: {
    opacity: [0, 1],
    transition: {
      duration: 0.05,
      staggerChildren: 0.03
    }
  }
};
```

---

## 9. تحسين الأداء (Performance)

- **React Server Components** للصفحات الثابتة
- **Suspense Boundaries** للتحميل التدريجي
- **Image Optimization** عبر `next/image`
- **Code Splitting** التلقائي من Next.js
- **Memoization** للمكونات الثقيلة
- **Virtual Scrolling** لسجل الـ Console الطويل
