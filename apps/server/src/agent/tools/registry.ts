import { z } from 'zod';

/**
 * 🛠️ DIRECTOR AGENT TOOL REGISTRY
 * Professional-grade tools for autonomous video engineering
 */

export const TOOLS = [
    // ═══════════════════════════════════════════════════════════════
    // 📁 FILE OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    {
        name: "write_file",
        description: "Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Use for creating NEW components or scenes. For editing existing files, prefer atomic_edit.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Relative path in your project folder (e.g., 'Main.tsx' for main composition)" },
                content: { type: "STRING", description: "The COMPLETE content of the file" }
            },
            required: ["path", "content"]
        }
    },
    {
        name: "read_file",
        description: "Read the content of a file. Returns the file content with line numbers for reference.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Path to the file" }
            },
            required: ["path"]
        }
    },
    {
        name: "list_files",
        description: "List files and directories in a path. Use to explore project structure.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Directory path (default: root)" }
            },
            required: ["path"]
        }
    },
    {
        name: "get_my_assets",
        description: "Returns the EXACT list of uploaded images and audio files in YOUR project. ALWAYS call this FIRST before writing any code that references assets. This prevents path errors.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "delete_file",
        description: "Delete a file. Use carefully - only for removing unnecessary generated files.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Path to the file to delete" }
            },
            required: ["path"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔪 SURGICAL EDITING (Cursor-style)
    // ═══════════════════════════════════════════════════════════════
    {
        name: "atomic_edit",
        description: "Make precise line-level edits to an existing file. More efficient than write_file for small changes. Specify exact line ranges to replace.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Path to the file to edit" },
                edits: {
                    type: "ARRAY",
                    description: "Array of edit operations",
                    items: {
                        type: "OBJECT",
                        properties: {
                            startLine: { type: "NUMBER", description: "Starting line number (1-indexed)" },
                            endLine: { type: "NUMBER", description: "Ending line number (inclusive)" },
                            newContent: { type: "STRING", description: "New content to replace the specified lines" }
                        },
                        required: ["startLine", "endLine", "newContent"]
                    }
                }
            },
            required: ["path", "edits"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔧 BUILD & VERIFICATION
    // ═══════════════════════════════════════════════════════════════
    {
        name: "run_build_check",
        description: "Run TypeScript compilation check on the project. Returns any type errors or compilation issues. ALWAYS run this after making code changes to verify correctness.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "run_command",
        description: "Execute a shell command in the workspace. Use for installing packages or running scripts. Commands are executed in packages/remotion-core directory.",
        parameters: {
            type: "OBJECT",
            properties: {
                command: { type: "STRING", description: "The command to run (e.g., 'pnpm add gsap')" }
            },
            required: ["command"]
        }
    },
    {
        name: "install_package",
        description: "Install npm packages needed for your creative vision. Call this BEFORE writing files that use external libraries. Packages are installed at the root level for the entire monorepo.",
        parameters: {
            type: "OBJECT",
            properties: {
                packages: { 
                    type: "ARRAY", 
                    items: { type: "STRING" },
                    description: "Array of package names to install (e.g., ['styled-components', 'framer-motion'])" 
                },
                reason: { type: "STRING", description: "Brief explanation of why these packages are needed for your creative vision" }
            },
            required: ["packages", "reason"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎬 COMPOSITION REGISTRATION
    // ═══════════════════════════════════════════════════════════════
    {
        name: "register_composition",
        description: "Register a new composition in Root.tsx and update PreviewEntry.tsx to display it. Call this after creating a new video composition.",
        parameters: {
            type: "OBJECT",
            properties: {
                componentName: { type: "STRING", description: "Name of the exported component (e.g., 'Main')" },
                importPath: { type: "STRING", description: "File path in your project folder (e.g., 'Main' for Main.tsx)" },
                durationInFrames: { type: "NUMBER", description: "Total duration in frames (fps * seconds)" },
                fps: { type: "NUMBER", description: "Frames per second (default: 30)" },
                width: { type: "NUMBER", description: "Video width (default: 1920)" },
                height: { type: "NUMBER", description: "Video height (default: 1080)" }
            },
            required: ["componentName", "importPath", "durationInFrames"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧠 PROJECT MEMORY & CONTINUITY
    // ═══════════════════════════════════════════════════════════════
    {
        name: "update_log",
        description: "Append an entry to the Director's Log. Use this to record progress, future plans, or keep track of complex multi-step tasks. This persists across chat sessions.",
        parameters: {
            type: "OBJECT",
            properties: {
                entry: { type: "STRING", description: "The message to record in the log (e.g., 'Completed Scene 1. Planning Scene 2 transition next.')" }
            },
            required: ["entry"]
        }
    },
    {
        name: "record_decision",
        description: "Record a critical architectural or design decision. Useful for maintaining consistency in styles, colors, or physics across different files.",
        parameters: {
            type: "OBJECT",
            properties: {
                context: { type: "STRING", description: "The area/component this decision affects (e.g., 'Color Palette' or 'Interpolation Strategy')" },
                choice: { type: "STRING", description: "The specific choice made (e.g., 'Using #FF00FF as primary neon glow color')" }
            },
            required: ["context", "choice"]
        }
    },
    {
        name: "validate_syntax",
        description: "Perform a quick syntax check on all project files without deploying. Helps catch errors before breaking the build.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "deploy_project",
        description: "Mirror all staged files to the Remotion engine and refresh the preview. Use this ONLY when you have finished writing/editing multiple files and want to see the results. This is your 'Commit' point.",
        parameters: {
            type: "OBJECT",
            properties: {
                message: { type: "STRING", description: "A brief summary of what is being deployed (e.g., 'Completed the intro scene and corrected the logo path')" }
            },
            required: ["message"]
        }
    },
    {
        name: "search_pixabay_assets",
        description: "Search Pixabay for royalty-free images or videos. Use this to find high-quality B-roll, backgrounds, or stock footage for the video.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: { type: "STRING", description: "Search query (e.g., 'luxury car', 'skyline', 'minimalist architecture')" },
                type: { type: "STRING", enum: ["photo", "video", "illustration", "vector"], description: "Type of asset to search for" },
                per_page: { type: "NUMBER", description: "Number of results (max 20)" }
            },
            required: ["query"]
        }
    },
    {
        name: "download_pixabay_asset",
        description: "Download a chosen asset from Pixabay into the project's asset folder. Assets MUST be downloaded before use (no hotlinking).",
        parameters: {
            type: "OBJECT",
            properties: {
                url: { type: "STRING", description: "The direct download URL from search results" },
                filename: { type: "STRING", description: "Desired filename (e.g., 'background-video.mp4' or 'hero-image.jpg')" },
                assetType: { type: "STRING", enum: ["image", "video", "audio"], description: "The category of the asset" }
            },
            required: ["url", "filename", "assetType"]
        }
    },
    {
        name: "get_sound_library",
        description: "Returns a list of high-quality internal sounds and background music available for use. Use this instead of Pixabay for audio.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "download_sound",
        description: "Download a specific sound from the internal library into your project's audio folder.",
        parameters: {
            type: "OBJECT",
            properties: {
                soundId: { type: "STRING", description: "The ID of the sound from get_sound_library (e.g., 'tech-bg-1')" }
            },
            required: ["soundId"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎵 SMART AUDIO SYSTEM 2.0
    // ═══════════════════════════════════════════════════════════════
    {
        name: "analyze_audio_requirements",
        description: "Analyze the video concept and automatically determine what BGM (background music), SFX (sound effects), and ambience are needed. Returns a detailed audio plan with timing, mood, and search keywords. CALL THIS EARLY in your workflow.",
        parameters: {
            type: "OBJECT",
            properties: {
                prompt: { type: "STRING", description: "The video concept/prompt to analyze" },
                scenes: {
                    type: "ARRAY",
                    description: "Array of scene definitions with timing",
                    items: {
                        type: "OBJECT",
                        properties: {
                            startFrame: { type: "NUMBER", description: "Scene start frame" },
                            endFrame: { type: "NUMBER", description: "Scene end frame" },
                            type: { type: "STRING", description: "Scene type: intro, content, transition, climax, outro" },
                            hasText: { type: "BOOLEAN", description: "Whether the scene contains text/typography" }
                        }
                    }
                },
                totalFrames: { type: "NUMBER", description: "Total video duration in frames" },
                fps: { type: "NUMBER", description: "Frames per second (default: 30)" }
            },
            required: ["prompt"]
        }
    },
    {
        name: "fetch_audio",
        description: "Generate audio using ElevenLabs (Sound Effects + Eleven Music) based on requirements. Automatically chooses between sound effects and music depending on type. Use this INSTEAD of manual sound searching or legacy sources.",
        parameters: {
            type: "OBJECT",
            properties: {
                type: { type: "STRING", enum: ["bgm", "sfx", "ambience"], description: "Type of audio to fetch" },
                mood: { type: "STRING", description: "Mood/style: epic, calm, tech, playful, corporate, dark, luxury, etc." },
                category: { type: "STRING", description: "For SFX: whoosh, impact, transition, reveal, click, pop, glitch, rise, fall, electric, etc." },
                keywords: {
                    type: "ARRAY",
                    description: "Additional search keywords",
                    items: { type: "STRING" }
                },
                timing: { type: "NUMBER", description: "Frame number where audio should start" },
                duration: { type: "NUMBER", description: "Duration in frames" }
            },
            required: ["type", "mood"]
        }
    },
    {
        name: "fetch_all_audio_from_plan",
        description: "Batch fetch ALL audio from an audio plan. This is the most efficient way to get all sounds at once. Returns a summary of successful and failed fetches.",
        parameters: {
            type: "OBJECT",
            properties: {
                audioPlan: {
                    type: "OBJECT",
                    description: "The audio plan object from analyze_audio_requirements"
                }
            },
            required: ["audioPlan"]
        }
    },
    {
        name: "get_audio_categories",
        description: "Returns all available audio moods and SFX categories for intelligent audio selection. Use this to understand what options are available.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 MOTION ENGINE 2.0
    // ═══════════════════════════════════════════════════════════════
    {
        name: "get_spring_presets",
        description: "Returns available Spring Physics animation presets for natural, physics-based motion. Springs create more organic movement than simple easing.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "get_camera_moves",
        description: "Returns available cinematic camera movements (dolly, pan, tilt, crane, shake, focus pull). Use these for professional video feel.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "get_easing_presets",
        description: "Returns the complete easing function library including advanced springs, elastic, and cinematic easings.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ✨ VFX ENGINE
    // ═══════════════════════════════════════════════════════════════
    {
        name: "get_particle_presets",
        description: "Returns available particle system presets (confetti, sparks, dust, glow, snow, etc.) for visual effects.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "get_color_grades",
        description: "Returns available color grading/LUT presets for cinematic looks (orange_teal, film_noir, vintage, tech_cold, etc.)",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "get_lens_effects",
        description: "Returns available lens effects (vignette, chromatic aberration, film grain, lens flare, bloom).",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧠 INTELLIGENCE ENGINE
    // ═══════════════════════════════════════════════════════════════
    {
        name: "analyze_brand_assets",
        description: "Analyze uploaded brand assets (logo, images) and extract Brand DNA: colors, style, mood, and recommendations for consistent video design.",
        parameters: {
            type: "OBJECT",
            properties: {
                imagePath: { type: "STRING", description: "Path to the image to analyze (e.g., 'assets/images/logo.png')" }
            },
            required: ["imagePath"]
        }
    },
    {
        name: "generate_narrative_structure",
        description: "Generate an optimal narrative/story structure for the video based on type and duration. Returns scene breakdown with timing.",
        parameters: {
            type: "OBJECT",
            properties: {
                videoType: { type: "STRING", enum: ["ad", "explainer", "brand", "promo", "social"], description: "Type of video" },
                durationSeconds: { type: "NUMBER", description: "Target duration in seconds" },
                keyMessage: { type: "STRING", description: "The main message or CTA of the video" }
            },
            required: ["videoType", "durationSeconds"]
        }
    },
    {
        name: "calculate_emotional_curve",
        description: "Calculate the optimal emotional pacing curve for the video. Returns intensity values for each section to guide animation energy.",
        parameters: {
            type: "OBJECT",
            properties: {
                durationSeconds: { type: "NUMBER", description: "Video duration in seconds" },
                style: { type: "STRING", enum: ["build_release", "constant_energy", "dramatic_arc", "pulse"], description: "Pacing style" }
            },
            required: ["durationSeconds"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧠 ADVANCED MEMORY SYSTEM
    // ═══════════════════════════════════════════════════════════════
    {
        name: "get_animation_recommendations",
        description: "Get AI-learned animation recommendations from memory based on past successful patterns. Use before creating animations to leverage learned best practices.",
        parameters: {
            type: "OBJECT",
            properties: {
                animationType: { type: "STRING", enum: ["entrance", "exit", "transition", "emphasis", "reveal"], description: "Type of animation needed" }
            },
            required: ["animationType"]
        }
    },
    {
        name: "get_audio_recommendations",
        description: "Get AI-learned audio recommendations from memory. Returns optimal sound choices based on scene type and mood from past successful projects.",
        parameters: {
            type: "OBJECT",
            properties: {
                sceneType: { type: "STRING", enum: ["intro", "content", "transition", "climax", "outro", "logo"], description: "Type of scene" },
                mood: { type: "STRING", enum: ["epic", "calm", "tech", "playful", "corporate", "emotional", "dark", "luxury", "energetic", "mysterious"], description: "Desired mood (optional)" }
            },
            required: ["sceneType"]
        }
    },
    {
        name: "get_template_recommendations",
        description: "Get composition template recommendations from memory. Returns proven templates based on video type and keywords from past successful projects.",
        parameters: {
            type: "OBJECT",
            properties: {
                videoType: { type: "STRING", enum: ["ad", "explainer", "brand", "promo", "social", "intro", "logo"], description: "Type of video" },
                keywords: { 
                    type: "ARRAY", 
                    items: { type: "STRING" },
                    description: "Keywords describing the desired style/content" 
                }
            },
            required: []
        }
    },
    {
        name: "learn_animation_success",
        description: "Store a successful animation pattern in memory for future use. Call this after creating an animation that works well to improve future recommendations.",
        parameters: {
            type: "OBJECT",
            properties: {
                animation: {
                    type: "OBJECT",
                    description: "Animation configuration",
                    properties: {
                        type: { type: "STRING", description: "Animation type" },
                        easing: { type: "STRING", description: "Easing function used" },
                        duration: { type: "NUMBER", description: "Duration in frames" },
                        properties: { type: "OBJECT", description: "Animated properties" }
                    }
                },
                sceneType: { type: "STRING", description: "Type of scene where this animation was used" },
                feedback: { type: "NUMBER", description: "Success rating 1-5" }
            },
            required: ["animation", "sceneType"]
        }
    },
    {
        name: "learn_audio_success",
        description: "Store a successful audio choice in memory for future use. Call this after using audio that works well with the visuals.",
        parameters: {
            type: "OBJECT",
            properties: {
                audio: {
                    type: "OBJECT",
                    description: "Audio details",
                    properties: {
                        sceneType: { type: "STRING", description: "Scene type" },
                        audioType: { type: "STRING", description: "bgm, sfx, or ambience" },
                        mood: { type: "STRING", description: "Audio mood" },
                        filename: { type: "STRING", description: "Audio filename" }
                    }
                },
                feedback: { type: "NUMBER", description: "Success rating 1-5" }
            },
            required: ["audio"]
        }
    },
    {
        name: "search_memory",
        description: "Search the agent's memory for relevant past knowledge. Useful for finding solutions to similar problems or recalling past decisions.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: { type: "STRING", description: "Search query (keywords or description)" },
                limit: { type: "NUMBER", description: "Maximum results to return (default: 5)" }
            },
            required: ["query"]
        }
    },
    {
        name: "get_memory_stats",
        description: "Get statistics about the agent's memory system. Shows total memories, patterns learned, and memory usage.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 📋 PROJECT PLAN SYSTEM (PLAN.md)
    // ═══════════════════════════════════════════════════════════════
    {
        name: "create_project_plan",
        description: "Create PLAN.md - MUST be called FIRST before any other tool. Defines file structure, scenes timeline, and audio plan. This creates a modular project structure with scenes/ folder.",
        parameters: {
            type: "OBJECT",
            properties: {
                scenes: {
                    type: "ARRAY",
                    description: "Array of scene definitions",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: { type: "STRING", description: "Scene name (e.g., 'IntroScene')" },
                            fileName: { type: "STRING", description: "File path (e.g., 'scenes/IntroScene.tsx')" },
                            startFrame: { type: "NUMBER", description: "Start frame" },
                            endFrame: { type: "NUMBER", description: "End frame" },
                            description: { type: "STRING", description: "Scene description" }
                        },
                        required: ["name", "fileName", "startFrame", "endFrame"]
                    }
                },
                bgmDecision: {
                    type: "OBJECT",
                    description: "Background music decision",
                    properties: {
                        needed: { type: "BOOLEAN", description: "Whether BGM is needed" },
                        reason: { type: "STRING", description: "Reason for the decision" },
                        mood: { type: "STRING", description: "BGM mood if needed" }
                    },
                    required: ["needed", "reason"]
                },
                sfxPlan: {
                    type: "ARRAY",
                    description: "Sound effects plan - MANDATORY for every scene transition",
                    items: {
                        type: "OBJECT",
                        properties: {
                            frame: { type: "NUMBER", description: "Frame number for SFX" },
                            type: { type: "STRING", description: "SFX type: whoosh, impact, transition, reveal, rise, etc." },
                            scene: { type: "STRING", description: "Which scene this SFX belongs to" }
                        },
                        required: ["frame", "type", "scene"]
                    }
                },
                duration: { type: "NUMBER", description: "Total duration in frames" },
                fps: { type: "NUMBER", description: "Frames per second (default: 30)" }
            },
            required: ["scenes", "sfxPlan"]
        }
    },
    {
        name: "update_project_plan",
        description: "Update PLAN.md with progress, audio files, or logs. Call this after completing each step.",
        parameters: {
            type: "OBJECT",
            properties: {
                section: { 
                    type: "STRING", 
                    enum: ["progress", "audio", "files", "log"],
                    description: "Section to update: progress (checkboxes), audio (file paths), files (status), log (add entry)"
                },
                data: { 
                    type: "OBJECT", 
                    description: "Update data - varies by section type"
                }
            },
            required: ["section", "data"]
        }
    },
    {
        name: "read_project_plan",
        description: "Read current PLAN.md to stay on track. Call this before writing any file to ensure you follow the plan.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎭 GSAP REFERENCE SYSTEM
    // ═══════════════════════════════════════════════════════════════
    {
        name: "get_gsap_reference",
        description: "Get GSAP animation reference and working code examples for Remotion. Use this when you need detailed code patterns for a specific GSAP plugin (SplitText, DrawSVGPlugin, ScrambleTextPlugin, etc.) or the full cookbook.",
        parameters: {
            type: "OBJECT",
            properties: {
                plugin: {
                    type: "STRING",
                    description: "Plugin name to get reference for: 'SplitText', 'DrawSVGPlugin', 'ScrambleTextPlugin', 'TextPlugin', 'CustomEase', 'CustomBounce', 'CustomWiggle', 'Physics2DPlugin', 'MotionPathPlugin', 'MorphSVGPlugin', 'EasePack', or 'all' for the full cookbook"
                }
            },
            required: ["plugin"]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🎲 3D REFERENCE SYSTEM (React Three Fiber)
    // ═══════════════════════════════════════════════════════════════
    {
        name: "get_three_reference",
        description: "Get React Three Fiber + Remotion 3D animation reference and working code examples. Use this when you need detailed code patterns for 3D scenes (ThreeCanvas, Text3D, particles, stars, materials, camera animation, 3D+2D hybrid, etc.).",
        parameters: {
            type: "OBJECT",
            properties: {
                topic: {
                    type: "STRING",
                    description: "Topic to get reference for: 'Text3D', 'particles', 'stars', 'materials', 'camera', 'hybrid', 'sparkles', 'environment', 'base', or 'all' for the full cookbook"
                }
            },
            required: ["topic"]
        }
    }
];

// ═══════════════════════════════════════════════════════════════
// 📋 ZOD SCHEMAS FOR VALIDATION
// ═══════════════════════════════════════════════════════════════

export const WriteFileSchema = z.object({
    path: z.string(),
    content: z.string()
});

export const AtomicEditSchema = z.object({
    path: z.string(),
    edits: z.array(z.object({
        startLine: z.number().int().positive(),
        endLine: z.number().int().positive(),
        newContent: z.string()
    }))
});

export const RegisterCompositionSchema = z.object({
    componentName: z.string(), importPath: z.string(),
    durationInFrames: z.number().int().positive(),
    fps: z.number().int().positive().default(30),
    width: z.number().int().positive().default(1920),
    height: z.number().int().positive().default(1080)
});

export const UpdateLogSchema = z.object({
    entry: z.string()
});

export const RecordDecisionSchema = z.object({
    context: z.string(),
    choice: z.string()
});
export const ValidateSyntaxSchema = z.object({});

export const DeployProjectSchema = z.object({
    message: z.string()
});

// ═══════════════════════════════════════════════════════════════
// 🎵 AUDIO SYSTEM 2.0 SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const AnalyzeAudioRequirementsSchema = z.object({
    prompt: z.string(),
    scenes: z.array(z.object({
        startFrame: z.number(),
        endFrame: z.number(),
        type: z.string(),
        hasText: z.boolean().optional()
    })).optional(),
    totalFrames: z.number().optional().default(300),
    fps: z.number().optional().default(30)
});

export const FetchAudioSchema = z.object({
    type: z.enum(['bgm', 'sfx', 'ambience']),
    mood: z.string(),
    category: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    timing: z.number().optional().default(0),
    duration: z.number().optional().default(150)
});

export const AnalyzeBrandAssetsSchema = z.object({
    imagePath: z.string()
});

export const GenerateNarrativeStructureSchema = z.object({
    videoType: z.enum(['ad', 'explainer', 'brand', 'promo', 'social']),
    durationSeconds: z.number(),
    keyMessage: z.string().optional()
});

export const CalculateEmotionalCurveSchema = z.object({
    durationSeconds: z.number(),
    style: z.enum(['build_release', 'constant_energy', 'dramatic_arc', 'pulse']).optional().default('build_release')
});

// ═══════════════════════════════════════════════════════════════
// 🧠 ADVANCED MEMORY SYSTEM SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const GetAnimationRecommendationsSchema = z.object({
    animationType: z.enum(['entrance', 'exit', 'transition', 'emphasis', 'reveal'])
});

export const GetAudioRecommendationsSchema = z.object({
    sceneType: z.enum(['intro', 'content', 'transition', 'climax', 'outro', 'logo']),
    mood: z.enum(['epic', 'calm', 'tech', 'playful', 'corporate', 'emotional', 'dark', 'luxury', 'energetic', 'mysterious']).optional()
});

export const GetTemplateRecommendationsSchema = z.object({
    videoType: z.enum(['ad', 'explainer', 'brand', 'promo', 'social', 'intro', 'logo']).optional(),
    keywords: z.array(z.string()).optional()
});

export const LearnAnimationSuccessSchema = z.object({
    animation: z.object({
        type: z.string(),
        easing: z.string().optional(),
        duration: z.number().optional(),
        properties: z.record(z.any()).optional()
    }),
    sceneType: z.string(),
    feedback: z.number().min(1).max(5).optional()
});

export const LearnAudioSuccessSchema = z.object({
    audio: z.object({
        sceneType: z.string(),
        audioType: z.string(),
        mood: z.string(),
        filename: z.string().optional()
    }),
    feedback: z.number().min(1).max(5).optional()
});

export const SearchMemorySchema = z.object({
    query: z.string(),
    limit: z.number().optional().default(5)
});

export const GetMemoryStatsSchema = z.object({});

// ═══════════════════════════════════════════════════════════════
// 📋 PROJECT PLAN SYSTEM SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const CreateProjectPlanSchema = z.object({
    scenes: z.array(z.object({
        name: z.string(),
        fileName: z.string(),
        startFrame: z.number(),
        endFrame: z.number(),
        description: z.string().optional()
    })),
    bgmDecision: z.object({
        needed: z.boolean(),
        reason: z.string(),
        mood: z.string().optional()
    }).optional(),
    sfxPlan: z.array(z.object({
        frame: z.number(),
        type: z.string(),
        scene: z.string()
    })),
    duration: z.number().optional(),
    fps: z.number().optional().default(30)
});

export const UpdateProjectPlanSchema = z.object({
    section: z.enum(['progress', 'audio', 'files', 'log']),
    data: z.record(z.any())
});

export const ReadProjectPlanSchema = z.object({});
