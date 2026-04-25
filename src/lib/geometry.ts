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
    case 'top':
      return { sx: 0, sy: 0, sw: srcW, sh: srcH / 2 };
    case 'bottom':
      return { sx: 0, sy: srcH / 2, sw: srcW, sh: srcH / 2 };
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
  return {
    dx: (cw - dw) / 2 + config.offsetX,
    dy: (ch - dh) / 2 + config.offsetY,
    dw,
    dh,
  };
}

export const SNAP_THRESHOLD = 12;

export function snapToCenter(value: number): number {
  return Math.abs(value) < SNAP_THRESHOLD ? 0 : value;
}
