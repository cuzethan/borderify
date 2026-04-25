import type { PhotoConfig } from '../types';
import { CANVAS_PRESETS } from './presets';
import { drawBorder } from './borders';
import { computeDestRect, effectiveSource } from './geometry';

/**
 * Single source of truth for drawing a photo onto a canvas.
 * Used by both the on-screen preview and the off-screen export pipeline,
 * so what the user sees is what they download.
 */
export function renderPhotoToCanvas(
  config: PhotoConfig,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): void {
  const { w, h } = CANVAS_PRESETS[config.preset];
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  drawBorder(ctx, config);

  const dest = computeDestRect(config);
  const src = effectiveSource(config);
  ctx.drawImage(config.bitmap, src.sx, src.sy, src.sw, src.sh, dest.dx, dest.dy, dest.dw, dest.dh);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('canvas.toBlob returned null'));
      },
      type,
      quality,
    );
  });
}
