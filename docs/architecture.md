# 🎬 The Director Agent - System Architecture

> **مخطط النظام الشامل لوكيل الموشن جرافيك الذكي**

---

## 1. الرؤية التقنية (Technical Vision)

```mermaid
flowchart TB
    subgraph USER["👤 المستخدم"]
        UI[واجهة المستخدم]
    end
    
    subgraph BRAIN["🧠 العقل - Gemini 3 Pro"]
        THINK[التفكير والتخطيط]
        VISION[الإدراك البصري]
        DECISION[اتخاذ القرارات]
    end
    
    subgraph MOTOR["⚙️ الجهاز الحركي"]
        GSAP[GSAP Timeline]
        REMOTION[Remotion Renderer]
    end
    
    subgraph NERVOUS["🔌 الجهاز العصبي"]
        SERVER[Node.js Server]
        SANDBOX[Sandboxed Environment]
    end
    
    UI --> |Prompt + Assets| SERVER
    SERVER --> |Context| BRAIN
    BRAIN --> |Function Calls| MOTOR
    MOTOR --> |Live Preview| UI
    BRAIN --> |Self-Correction| VISION
```

---

## 2. المكونات الأساسية (Core Components)

| المكون | الدور | التقنية |
|--------|-------|---------|
| **العقل** | التفكير، التخطيط، توليد الكود | Gemini 3 Pro (2M context window) |
| **الجهاز الحركي** | تنفيذ الحركات والرندر | GSAP + Remotion |
| **الجهاز العصبي** | إدارة الصلاحيات والملفات | Node.js + Express |
| **الذاكرة** | السياق والتعلم | Redis + Vector DB |

---

## 3. طبقات النظام (System Layers)

### Layer 1: Presentation Layer (طبقة العرض)
- **Next.js 15** App Router
- **Shadcn UI** + Tailwind CSS (Dark Mode)
- **Framer Motion** للحركات الانتقالية
- **Socket.io Client** للتحديثات الفورية

### Layer 2: Communication Layer (طبقة الاتصال)
- **REST API** للعمليات العادية
- **WebSocket** للـ Streaming والتحديثات الحية
- **Server-Sent Events** لسجل التفكير

### Layer 3: Agent Core Layer (طبقة الوكيل)
- **Gemini 3 Pro SDK** مع Function Calling
- **Tool Registry** لإدارة الصلاحيات
- **Memory Manager** للسياق المتعدد الطبقات

### Layer 4: Execution Layer (طبقة التنفيذ)
- **Remotion Bundler** لبناء الفيديو
- **GSAP Engine** للحركات
- **Asset Pipeline** لإدارة الأصول

### Layer 5: Persistence Layer (طبقة الحفظ)
- **PostgreSQL** للبيانات الرئيسية
- **Redis** للـ Session والـ Cache
- **S3/Cloudflare R2** للأصول والفيديوهات

---

## 4. تدفق البيانات (Data Flow)

```mermaid
sequenceDiagram
    participant U as المستخدم
    participant F as Frontend
    participant S as Server
    participant G as Gemini 3 Pro
    participant R as Remotion
    
    U->>F: إدخال الـ Prompt + رفع الأصول
    F->>S: POST /api/generate
    S->>G: إرسال السياق + الأدوات المتاحة
    
    loop حلقة التوليد
        G->>S: Function Call (create_component)
        S->>R: تحديث كود المشروع
        R->>F: Hot Reload (WebSocket)
        F->>U: معاينة حية
        
        G->>S: Function Call (visual_inspection)
        S->>G: صورة الفريم الحالي
        G->>G: تحليل + تصحيح ذاتي
    end
    
    G->>S: اكتمال التوليد
    S->>F: رابط التحميل النهائي
    F->>U: عرض الفيديو الكامل
```

---

## 5. بنية الأمان (Security Architecture)

### Sandbox Environment
```
┌─────────────────────────────────────────┐
│           Docker Container              │
│  ┌───────────────────────────────────┐  │
│  │     Agent Workspace (Isolated)    │  │
│  │  ┌─────────┐  ┌─────────────────┐ │  │
│  │  │ Remotion│  │ Generated Code  │ │  │
│  │  │ Project │  │    (Scoped)     │ │  │
│  │  └─────────┘  └─────────────────┘ │  │
│  └───────────────────────────────────┘  │
│              ↓ Controlled Access ↓       │
│  ┌───────────────────────────────────┐  │
│  │         Host File System          │  │
│  │    (Read-only for templates)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Permission Boundaries
- **الوكيل** لا يملك وصولاً مباشراً لنظام الملفات الرئيسي
- كل مشروع في **حاوية معزولة**
- **Rate Limiting** على استدعاءات Function Calling
- **Audit Logging** لكل عملية

---

## 6. قابلية التوسع (Scalability)

```mermaid
flowchart LR
    subgraph LB["Load Balancer"]
        NGINX[Nginx]
    end
    
    subgraph WORKERS["Worker Pool"]
        W1[Worker 1]
        W2[Worker 2]
        W3[Worker N]
    end
    
    subgraph RENDER["Render Farm"]
        R1[Remotion Lambda 1]
        R2[Remotion Lambda 2]
        R3[Remotion Lambda N]
    end
    
    NGINX --> W1 & W2 & W3
    W1 & W2 & W3 --> R1 & R2 & R3
```

- **Horizontal Scaling** للـ Workers
- **Remotion Lambda** للرندر الموزع
- **Queue System** (Bull/BullMQ) لإدارة الطلبات
