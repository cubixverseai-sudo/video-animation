/**
 * Public entrypoint for the Director Remotion bundle.
 *
 * IMPORTANT:
 * - This file should remain stable so that bundlers and tools can always
 *   import `@director/remotion` without depending on a specific project.
 * - The *actual* composition to preview is resolved via `PreviewEntry.tsx`,
 *   which the Agent keeps up to date for the active project.
 *
 * This keeps the package API clean while still allowing the Agent to swap
 * out the current composition dynamically.
 */
export { CurrentComposition, currentProps } from './PreviewEntry';
