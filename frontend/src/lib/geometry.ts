import type { CropRect, PhotoConfig, SplitHalf } from '../types';
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

export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };
const MIN_CROP_SIZE = 0.05;

export function normalizeCrop(crop: CropRect | undefined): CropRect {
  const x = crop?.x ?? 0;
  const y = crop?.y ?? 0;
  const w = crop?.w ?? 1;
  const h = crop?.h ?? 1;
  const clampedW = Math.min(1, Math.max(MIN_CROP_SIZE, w));
  const clampedH = Math.min(1, Math.max(MIN_CROP_SIZE, h));
  const clampedX = Math.min(1 - clampedW, Math.max(0, x));
  const clampedY = Math.min(1 - clampedH, Math.max(0, y));
  return { x: clampedX, y: clampedY, w: clampedW, h: clampedH };
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

/** Effective source rect before crop (accounts for split, otherwise full image). */
export function effectiveBaseSource(config: PhotoConfig): SourceRect {
  if (config.splitOf) return sliceForHalf(config.naturalW, config.naturalH, config.splitOf.half);
  return { sx: 0, sy: 0, sw: config.naturalW, sh: config.naturalH };
}

/** Effective source rect after split + crop. */
export function effectiveSource(config: PhotoConfig): SourceRect {
  const base = effectiveBaseSource(config);
  const crop = normalizeCrop(config.crop);
  return {
    sx: base.sx + base.sw * crop.x,
    sy: base.sy + base.sh * crop.y,
    sw: base.sw * crop.w,
    sh: base.sh * crop.h,
  };
}

/** Compute final destination rect on canvas given config + source slice. */
export function computeDestRect(config: PhotoConfig): DestRect {
  const { w: cw, h: ch } = CANVAS_PRESETS[config.preset];
  // Keep transform geometry stable against the pre-crop frame so crop box
  // interactions map predictably to the on-canvas image.
  const src = effectiveBaseSource(config);
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

/** Destination rect if only split is applied (used by crop overlay interactions). */
export function computeBaseDestRect(config: PhotoConfig): DestRect {
  const { w: cw, h: ch } = CANVAS_PRESETS[config.preset];
  const src = effectiveBaseSource(config);
  const fit = fitContain(src.sw, src.sh, cw, ch);
  const dw = fit.dw * config.scale;
  const dh = fit.dh * config.scale;
  const anchoredDx = config.splitOf
    ? config.splitOf.half === 'left'
      ? cw - dw
      : 0
    : (cw - dw) / 2;
  return {
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

function centerOffsetTarget(photo: PhotoConfig): { offsetX: number; offsetY: number } {
  const { w: cw, h: ch } = CANVAS_PRESETS[photo.preset];
  const src = effectiveBaseSource(photo);
  const fit = fitContain(src.sw, src.sh, cw, ch);
  const dw = fit.dw * photo.scale;
  const dh = fit.dh * photo.scale;
  const anchoredDx = photo.splitOf
    ? photo.splitOf.half === 'left'
      ? cw - dw
      : 0
    : (cw - dw) / 2;
  const crop = normalizeCrop(photo.crop);
  const cropCenterX = crop.x + crop.w / 2;
  const cropCenterY = crop.y + crop.h / 2;
  return {
    offsetX: cw / 2 - anchoredDx - dw * cropCenterX,
    offsetY: ch / 2 - (ch - dh) / 2 - dh * cropCenterY,
  };
}

export function snapTransformToVisibleCenter(
  photo: PhotoConfig,
  offsetX: number,
  offsetY: number,
): { offsetX: number; offsetY: number; snappedX: boolean; snappedY: boolean } {
  const target = centerOffsetTarget(photo);
  const snappedX = Math.abs(offsetX - target.offsetX) < SNAP_THRESHOLD;
  const snappedY = Math.abs(offsetY - target.offsetY) < SNAP_THRESHOLD;
  return {
    offsetX: snappedX ? target.offsetX : offsetX,
    offsetY: snappedY ? target.offsetY : offsetY,
    snappedX,
    snappedY,
  };
}

export function isVisiblyCentered(photo: PhotoConfig): boolean {
  const target = centerOffsetTarget(photo);
  return Math.abs(photo.offsetX - target.offsetX) < 0.5 && Math.abs(photo.offsetY - target.offsetY) < 0.5;
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
  // Crop should not alter pan/zoom bounds; bounds are based on the base frame.
  const src = effectiveBaseSource(photo);
  const fit = fitContain(src.sw, src.sh, cw, ch);

  // Split halves stay seam-anchored, but should still be resizable.
  // Non-split photos keep previous "fit-inside-canvas" max behavior.
  const maxScale = photo.splitOf ? 5 : Math.min(cw / fit.dw, ch / fit.dh);
  const clampedScale = Math.max(0.05, Math.min(maxScale, scale));

  const dw = fit.dw * clampedScale;
  const dh = fit.dh * clampedScale;
  const crop = normalizeCrop(photo.crop);
  const anchoredDx = photo.splitOf
    ? photo.splitOf.half === 'left'
      ? cw - dw
      : 0
    : (cw - dw) / 2;
  const baseTop = (ch - dh) / 2;

  const minOffsetX = -anchoredDx - dw * crop.x;
  const maxOffsetX = cw - anchoredDx - dw * (crop.x + crop.w);
  const minOffsetY = -baseTop - dh * crop.y;
  const maxOffsetY = ch - baseTop - dh * (crop.y + crop.h);

  const finalMinOffsetX = photo.splitOf ? 0 : Math.min(minOffsetX, maxOffsetX);
  const finalMaxOffsetX = photo.splitOf ? 0 : Math.max(minOffsetX, maxOffsetX);
  const finalMinOffsetY = Math.min(minOffsetY, maxOffsetY);
  const finalMaxOffsetY = Math.max(minOffsetY, maxOffsetY);

  return {
    scale: clampedScale,
    offsetX: Math.max(finalMinOffsetX, Math.min(finalMaxOffsetX, offsetX)),
    offsetY: Math.max(finalMinOffsetY, Math.min(finalMaxOffsetY, offsetY)),
  };
}
