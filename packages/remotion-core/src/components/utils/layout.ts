/**
 * 📐 LAYOUT UTILITIES
 * Professional grid system and safe areas for Motion Graphics
 */

// ═══════════════════════════════════════════════════════════════
// SAFE AREAS (Broadcast Standards)
// ═══════════════════════════════════════════════════════════════

export const SAFE_AREAS = {
  // Title Safe: 10% from edges (text must stay within)
  TITLE: {
    top: 0.1,
    bottom: 0.1,
    left: 0.1,
    right: 0.1,
  },
  // Action Safe: 5% from edges (important action must stay within)
  ACTION: {
    top: 0.05,
    bottom: 0.05,
    left: 0.05,
    right: 0.05,
  },
  // Social Safe: Extra margin for social platforms
  SOCIAL: {
    top: 0.15,
    bottom: 0.15,
    left: 0.08,
    right: 0.08,
  },
} as const;

/**
 * Calculate safe area pixels for a given resolution
 */
export const getSafeAreaPixels = (
  width: number,
  height: number,
  safeArea: keyof typeof SAFE_AREAS = 'TITLE'
) => {
  const area = SAFE_AREAS[safeArea];
  return {
    top: Math.round(height * area.top),
    bottom: Math.round(height * area.bottom),
    left: Math.round(width * area.left),
    right: Math.round(width * area.right),
    innerWidth: Math.round(width * (1 - area.left - area.right)),
    innerHeight: Math.round(height * (1 - area.top - area.bottom)),
  };
};

// ═══════════════════════════════════════════════════════════════
// GRID SYSTEM
// ═══════════════════════════════════════════════════════════════

export const GRID = {
  COLUMNS: 12,
  GUTTER: 40,
  MARGIN: 120,
} as const;

/**
 * Calculate column width for a resolution
 */
export const getColumnWidth = (
  width: number,
  margin: number = GRID.MARGIN,
  gutter: number = GRID.GUTTER,
  columns: number = GRID.COLUMNS
): number => {
  const totalGutters = (columns - 1) * gutter;
  const availableWidth = width - (margin * 2) - totalGutters;
  return availableWidth / columns;
};

/**
 * Get X position for a column
 */
export const getColumnX = (
  column: number,
  width: number,
  margin: number = GRID.MARGIN,
  gutter: number = GRID.GUTTER
): number => {
  const colWidth = getColumnWidth(width, margin, gutter);
  return margin + (column * (colWidth + gutter));
};

/**
 * Get width spanning multiple columns
 */
export const getSpanWidth = (
  span: number,
  width: number,
  margin: number = GRID.MARGIN,
  gutter: number = GRID.GUTTER
): number => {
  const colWidth = getColumnWidth(width, margin, gutter);
  return (colWidth * span) + (gutter * (span - 1));
};

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY SCALE
// ═══════════════════════════════════════════════════════════════

export const TYPE_SCALE = {
  // Major third ratio (1.25)
  h1: 120,    // Hero headlines
  h2: 96,     // Section headlines
  h3: 72,     // Subsections
  h4: 56,     // Large body
  h5: 44,     // Medium body
  h6: 36,     // Small body
  body: 28,   // Body text
  small: 22,  // Small text
  tiny: 18,   // Labels
  micro: 14,  // Fine print
} as const;

/**
 * Scale typography for different resolutions
 */
export const scaleType = (
  baseSize: number,
  targetWidth: number,
  referenceWidth: number = 1920
): number => {
  return Math.round(baseSize * (targetWidth / referenceWidth));
};

// ═══════════════════════════════════════════════════════════════
// POSITIONING HELPERS
// ═══════════════════════════════════════════════════════════════

export type Alignment = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Get flexbox styles for alignment
 */
export const getAlignmentStyles = (alignment: Alignment): React.CSSProperties => {
  const [vertical, horizontal] = alignment.split('-') as [string, string?];
  
  const justifyContent = {
    'top': 'flex-start',
    'center': 'center',
    'bottom': 'flex-end',
  }[vertical] || 'center';
  
  const alignItems = horizontal ? {
    'left': 'flex-start',
    'center': 'center',
    'right': 'flex-end',
  }[horizontal] : 'center';
  
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent,
    alignItems,
  };
};

/**
 * Center content helper
 */
export const CENTER_STYLES: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * Stack content vertically with gap
 */
export const stackStyles = (gap: number = 20): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap,
});

/**
 * Row layout with gap
 */
export const rowStyles = (gap: number = 20): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap,
});

// ═══════════════════════════════════════════════════════════════
// RESOLUTION PRESETS
// ═══════════════════════════════════════════════════════════════

export const RESOLUTIONS = {
  // Landscape
  HD: { width: 1920, height: 1080, name: '1080p' },
  '4K': { width: 3840, height: 2160, name: '4K' },
  
  // Square
  SQUARE: { width: 1080, height: 1080, name: 'Square' },
  SQUARE_4K: { width: 2160, height: 2160, name: 'Square 4K' },
  
  // Portrait/Vertical
  VERTICAL: { width: 1080, height: 1920, name: 'Vertical' },
  VERTICAL_4K: { width: 2160, height: 3840, name: 'Vertical 4K' },
  
  // Social specific
  INSTAGRAM_REEL: { width: 1080, height: 1920, name: 'Instagram Reel' },
  TIKTOK: { width: 1080, height: 1920, name: 'TikTok' },
  YOUTUBE_SHORTS: { width: 1080, height: 1920, name: 'YouTube Shorts' },
  INSTAGRAM_POST: { width: 1080, height: 1080, name: 'Instagram Post' },
  LINKEDIN: { width: 1920, height: 1080, name: 'LinkedIn' },
  TWITTER: { width: 1920, height: 1080, name: 'Twitter/X' },
} as const;
