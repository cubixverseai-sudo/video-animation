/**
 * 🧠 MEMORY MODULE - Complete Memory System Export
 * 
 * Director Agent 3.0 Advanced Memory System
 */

// Core Memory
export { MemoryCore, getMemoryCore, initializeMemoryCore } from './core/MemoryCore';
export type { 
    MemoryEntry, 
    MemoryQuery, 
    MemoryStats, 
    MemoryType, 
    MemoryImportance,
    WorkingMemory 
} from './core/MemoryCore';

// Smart Context
export { SmartContext, createSmartContext } from './core/SmartContext';
export type { 
    ContextSegment, 
    ContextBudget, 
    CompressedContext, 
    TaskContext 
} from './core/SmartContext';

// Memory Retrieval
export { MemoryRetrieval, createMemoryRetrieval } from './core/MemoryRetrieval';
export type { 
    RetrievalResult, 
    RetrievalOptions, 
    SemanticQuery, 
    PatternMatch 
} from './core/MemoryRetrieval';

// Motion Memory
export { MotionMemory, createMotionMemory } from './motion/MotionMemory';
export type { 
    AnimationPattern, 
    AnimationElement, 
    AnimationType,
    EasingCategory,
    TimingConfig, 
    EasingConfig, 
    CameraConfig,
    AnimationRecommendation,
    MotionStats 
} from './motion/MotionMemory';

// Audio Memory
export { AudioMemory, createAudioMemory } from './audio/AudioMemory';
export type { 
    AudioSceneMapping, 
    AudioType, 
    MoodType,
    SFXType,
    SFXPattern, 
    SFXTiming,
    AudioRecommendation,
    AudioLayerConfig 
} from './audio/AudioMemory';

// Template Library
export { TemplateLibrary, createTemplateLibrary } from './templates/TemplateLibrary';
export type { 
    CompositionTemplate, 
    TemplateStructure,
    SceneTemplate,
    VideoType,
    TemplateComplexity,
    TemplateRecommendation 
} from './templates/TemplateLibrary';

// Director Memory (Unified)
export { 
    DirectorMemory, 
    initializeDirectorMemory, 
    getDirectorMemory 
} from './DirectorMemory';
export type { 
    DirectorMemoryConfig, 
    ContextForAI, 
    LearningEvent 
} from './DirectorMemory';

// Legacy compatibility
export { AgentMemory } from './AgentMemory';
