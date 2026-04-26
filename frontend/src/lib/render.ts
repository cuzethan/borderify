import type { PhotoConfig } from '../types';
import { CANVAS_PRESETS } from './presets';
import { drawBorder } from './borders';
import { computeDestRect, effectiveBaseSource, normalizeCrop } from './geometry';

/**
 * Single source of truth for drawing a photo onto a canvas.
 * Used by both the on-screen preview and the off-screen export pipeline,
 * so what the user sees is what they download.
 */
export function renderPhotoToCanvas(
  config: PhotoConfig,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options?: { showCropUnderlay?: boolean },
): void {
  const { w, h } = CANVAS_PRESETS[config.preset];
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  drawBorder(ctx, config);

  const dest = computeDestRect(config);
  const src = effectiveBaseSource(config);
  const crop = normalizeCrop(config.crop);
  const clipX = dest.dx + dest.dw * crop.x;
  const clipY = dest.dy + dest.dh * crop.y;
  const clipW = dest.dw * crop.w;
  const clipH = dest.dh * crop.h;
  const showCropUnderlay = Boolean(options?.showCropUnderlay) && (crop.w < 0.999 || crop.h < 0.999 || crop.x > 0.001 || crop.y > 0.001);

  if (showCropUnderlay) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(config.bitmap, src.sx, src.sy, src.sw, src.sh, dest.dx, dest.dy, dest.dw, dest.dh);
    ctx.restore();
  }

  // Crop is non-destructive and operates as a visible window over the mapped image.
  // This avoids resampling/stretching when the crop box is resized.
  ctx.save();
  ctx.beginPath();
  ctx.rect(clipX, clipY, clipW, clipH);
  ctx.clip();
  ctx.drawImage(config.bitmap, src.sx, src.sy, src.sw, src.sh, dest.dx, dest.dy, dest.dw, dest.dh);
  ctx.restore();
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
