import type { PhotoConfig, SplitHalf } from '../types';
import { CANVAS_PRESETS } from './presets';

export interface DestRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function fitContain(srcW: number, srcH: number, canvasW: number, canvasH: number): DestRect {
  const scale = Math.min(canvasW / srcW, canvasH / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  return {
    dx: (canvasW - dw) / 2,
    dy: (canvasH - dh) / 2,
    dw,
    dh,
  };
}

export function sliceForHalf(srcW: number, srcH: number, half: SplitHalf): SourceRect {
  switch (half) {
    case 'left':
      return { sx: 0, sy: 0, sw: srcW / 2, sh: srcH };
    case 'right':
      return { sx: srcW / 2, sy: 0, sw: srcW / 2, sh: srcH };
    default:
      // Defensive fallback: never return an invalid source rect.
      return { sx: 0, sy: 0, sw: srcW, sh: srcH };
  }
}

/** Effective source rect (accounts for split, otherwise full image). */
export function effectiveSource(config: PhotoConfig): SourceRect {
  if (config.splitOf) return sliceForHalf(config.naturalW, config.naturalH, config.splitOf.half);
  return { sx: 0, sy: 0, sw: config.naturalW, sh: config.naturalH };
}

/** Compute final destination rect on canvas given config + source slice. */
export function computeDestRect(config: PhotoConfig): DestRect {
  const { w: cw, h: ch } = CANVAS_PRESETS[config.preset];
  const src = effectiveSource(config);
  const fit = fitContain(src.sw, src.sh, cw, ch);
  const dw = fit.dw * config.scale;
  const dh = fit.dh * config.scale;
  const anchoredDx = config.splitOf
    ? config.splitOf.half === 'left'
      ? cw - dw
      : 0
    : (cw - dw) / 2;
  return {
    // Split halves should hug the seam side, never re-center on the canvas x-axis.
    dx: anchoredDx + config.offsetX,
    dy: (ch - dh) / 2 + config.offsetY,
    dw,
    dh,
  };
}

export const SNAP_THRESHOLD = 60;

export function snapToCenter(value: number): number {
  return Math.abs(value) < SNAP_THRESHOLD ? 0 : value;
}

export function isCentered(offsetX: number, offsetY: number): boolean {
  return offsetX === 0 && offsetY === 0;
}

/**
 * Clamp scale/offset bounds for editor interactions.
 * Non-split images are kept fully within canvas bounds.
 * Split images stay seam-anchored (no horizontal panning) and can scale larger.
 */
export function clampTransform(
  photo: PhotoConfig,
  offsetX: number,
  offsetY: number,
  scale: number,
): { offsetX: number; offsetY: number; scale: number } {
  const { w: cw, h: ch } = CANVAS_PRESETS[photo.preset];
  const src = effectiveSource(photo);
  const fit = fitContain(src.sw, src.sh, cw, ch);

  // Split halves stay seam-anchored, but should still be resizable.
  // Non-split photos keep previous "fit-inside-canvas" max behavior.
  const maxScale = photo.splitOf ? 5 : Math.min(cw / fit.dw, ch / fit.dh);
  const clampedScale = Math.max(0.05, Math.min(maxScale, scale));

  const dw = fit.dw * clampedScale;
  const dh = fit.dh * clampedScale;
  const maxOffsetX = photo.splitOf ? 0 : Math.abs((cw - dw) / 2);
  const maxOffsetY = Math.abs((ch - dh) / 2);

  return {
    scale: clampedScale,
    offsetX: Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX)),
    offsetY: Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY)),
  };
}
