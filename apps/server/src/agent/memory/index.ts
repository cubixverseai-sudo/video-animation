/**
 * 🧠 MEMORY MODULE - ProjectBrain Unified Memory System
 * 
 * Single-file project-scoped memory replacing the old 9-file system.
 * Based on best practices from MemGPT, GitHub Copilot, LangMem, and Claude.
 */

// Primary: ProjectBrain (unified memory)
export { ProjectBrain } from './ProjectBrain';
export type { 
    BrainData,
    FileEntry,
    BrandIdentity,
    Decision,
    ConversationMessage,
    ActionEntry
} from './ProjectBrain';

// Legacy compatibility (kept for any external imports)
export { AgentMemory } from './AgentMemory';
