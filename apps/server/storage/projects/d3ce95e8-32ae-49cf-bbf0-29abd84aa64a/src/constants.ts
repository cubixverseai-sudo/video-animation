export const COLOR_PALETTE = {
  background: '#050505',
  text: '#FFFFFF',
  accent: '#FFD700', // Gold/Yellow - usually fits "The Beast" branding well
  secondary: '#1A1A1A',
};
export const PROJECT_ID = 'd3ce95e8-32ae-49cf-bbf0-29abd84aa64a';

export const getAssetPath = (filename: string) => {
  return `assets/${PROJECT_ID}/images/${filename}`;
};
