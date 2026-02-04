/**
 * 🎨 COLOR UTILITIES
 * Professional color manipulation for Motion Graphics
 */

// ═══════════════════════════════════════════════════════════════
// COLOR PALETTES
// ═══════════════════════════════════════════════════════════════

export const PALETTES = {
  // Dark mode primary (your existing)
  DARK: {
    bg: {
      primary: '#030303',
      secondary: '#0a0a0f',
      tertiary: '#12121a',
    },
    accent: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      glow: 'rgba(99, 102, 241, 0.3)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
    },
  },
  
  // Tech/Cyber
  TECH: {
    bg: { primary: '#000000', secondary: '#0d1117', tertiary: '#161b22' },
    accent: { primary: '#00ff88', secondary: '#00ccff', glow: 'rgba(0, 255, 136, 0.3)' },
    text: { primary: '#ffffff', secondary: '#8b949e', muted: '#484f58' },
  },
  
  // Luxury/Premium
  LUXURY: {
    bg: { primary: '#0a0a0a', secondary: '#1a1a1a', tertiary: '#2a2a2a' },
    accent: { primary: '#d4af37', secondary: '#c9a227', glow: 'rgba(212, 175, 55, 0.3)' },
    text: { primary: '#fafafa', secondary: '#a0a0a0', muted: '#666666' },
  },
  
  // Vibrant/Energy
  VIBRANT: {
    bg: { primary: '#0f0f0f', secondary: '#1a1a2e', tertiary: '#16213e' },
    accent: { primary: '#ff006e', secondary: '#8338ec', glow: 'rgba(255, 0, 110, 0.3)' },
    text: { primary: '#ffffff', secondary: '#e0e0e0', muted: '#888888' },
  },
  
  // Clean/Minimal
  CLEAN: {
    bg: { primary: '#ffffff', secondary: '#f8f9fa', tertiary: '#e9ecef' },
    accent: { primary: '#000000', secondary: '#343a40', glow: 'rgba(0, 0, 0, 0.1)' },
    text: { primary: '#212529', secondary: '#495057', muted: '#adb5bd' },
  },
  
  // Warm/Sunset
  WARM: {
    bg: { primary: '#1a0a0a', secondary: '#2d1810', tertiary: '#3d2218' },
    accent: { primary: '#ff6b35', secondary: '#f7931e', glow: 'rgba(255, 107, 53, 0.3)' },
    text: { primary: '#fff5f0', secondary: '#ffd4c4', muted: '#a08070' },
  },
  
  // Cool/Ocean
  COOL: {
    bg: { primary: '#0a1a1a', secondary: '#102030', tertiary: '#183040' },
    accent: { primary: '#00d4ff', secondary: '#0099cc', glow: 'rgba(0, 212, 255, 0.3)' },
    text: { primary: '#f0ffff', secondary: '#b0e0e0', muted: '#607080' },
  },
} as const;

export type PaletteName = keyof typeof PALETTES;

// ═══════════════════════════════════════════════════════════════
// GRADIENT PRESETS
// ═══════════════════════════════════════════════════════════════

export const GRADIENTS = {
  // Radial glows
  GLOW_INDIGO: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
  GLOW_VIOLET: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
  GLOW_CYAN: 'radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)',
  GLOW_GOLD: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
  GLOW_PINK: 'radial-gradient(circle, rgba(255, 0, 110, 0.4) 0%, transparent 70%)',
  
  // Linear gradients for text
  TEXT_INDIGO_VIOLET: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
  TEXT_CYAN_BLUE: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
  TEXT_GOLD: 'linear-gradient(135deg, #f59e0b 0%, #d4af37 50%, #fbbf24 100%)',
  TEXT_PINK_ORANGE: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #f97316 100%)',
  TEXT_GREEN_CYAN: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
  TEXT_SILVER: 'linear-gradient(135deg, #94a3b8 0%, #e2e8f0 50%, #94a3b8 100%)',
  
  // Background gradients
  BG_DARK_PURPLE: 'linear-gradient(180deg, #0a0a0f 0%, #1a1025 50%, #0a0a0f 100%)',
  BG_DARK_BLUE: 'linear-gradient(180deg, #030303 0%, #0a1628 50%, #030303 100%)',
  BG_DARK_RED: 'linear-gradient(180deg, #0a0505 0%, #1a0a10 50%, #0a0505 100%)',
  BG_MESH: 'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%)',
  
  // Vignette
  VIGNETTE_SOFT: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)',
  VIGNETTE_MEDIUM: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.6) 100%)',
  VIGNETTE_STRONG: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%)',
} as const;

// ═══════════════════════════════════════════════════════════════
// COLOR HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Parse hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Create RGBA string
 */
export const rgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Lighten a color
 */
export const lighten = (hex: string, amount: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.min(255, rgb.r + amount * 255),
    Math.min(255, rgb.g + amount * 255),
    Math.min(255, rgb.b + amount * 255)
  );
};

/**
 * Darken a color
 */
export const darken = (hex: string, amount: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.max(0, rgb.r - amount * 255),
    Math.max(0, rgb.g - amount * 255),
    Math.max(0, rgb.b - amount * 255)
  );
};

/**
 * Create glow shadow for text/elements
 */
export const createGlow = (color: string, intensity: number = 1): string => {
  return `
    0 0 ${10 * intensity}px ${rgba(color, 0.5)},
    0 0 ${30 * intensity}px ${rgba(color, 0.3)},
    0 0 ${60 * intensity}px ${rgba(color, 0.15)}
  `.trim();
};

/**
 * Create text shadow with depth
 */
export const createTextShadow = (color: string, blur: number = 10): string => {
  return `0 0 ${blur}px ${rgba(color, 0.5)}, 0 2px 4px rgba(0,0,0,0.3)`;
};

/**
 * Interpolate between two colors
 */
export const lerpColor = (color1: string, color2: string, t: number): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;
  
  return rgbToHex(
    rgb1.r + (rgb2.r - rgb1.r) * t,
    rgb1.g + (rgb2.g - rgb1.g) * t,
    rgb1.b + (rgb2.b - rgb1.b) * t
  );
};
