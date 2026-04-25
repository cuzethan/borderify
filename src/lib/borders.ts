import type { BorderConfig, PhotoConfig } from '../types';
import { CANVAS_PRESETS } from './presets';
import { effectiveSource } from './geometry';

export function drawBorder(ctx: CanvasRenderingContext2D, config: PhotoConfig): void {
  const { w, h } = CANVAS_PRESETS[config.preset];
  const b = config.border;
  switch (b.type) {
    case 'solid':
      drawSolid(ctx, w, h, b);
      break;
    case 'blurred':
      drawBlurred(ctx, w, h, config);
      break;
    case 'gradient':
      drawGradient(ctx, w, h, b);
      break;
    case 'stripes':
      drawStripes(ctx, w, h, b);
      break;
  }
}

function drawSolid(ctx: CanvasRenderingContext2D, w: number, h: number, b: BorderConfig): void {
  ctx.fillStyle = b.color;
  ctx.fillRect(0, 0, w, h);
}

function drawBlurred(ctx: CanvasRenderingContext2D, w: number, h: number, config: PhotoConfig): void {
  // Fill with the photo's average-ish color first as a fallback under the blur edges.
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const src = effectiveSource(config);
  // Cover-fill: scale image so it fully covers the canvas, then blur.
  const scale = Math.max(w / src.sw, h / src.sh);
  const dw = src.sw * scale;
  const dh = src.sh * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  ctx.save();
  ctx.filter = `blur(${config.border.blurAmount}px)`;
  ctx.drawImage(config.bitmap, src.sx, src.sy, src.sw, src.sh, dx, dy, dw, dh);
  ctx.restore();
}

function drawGradient(ctx: CanvasRenderingContext2D, w: number, h: number, b: BorderConfig): void {
  // Convert angle (degrees) into a vector across the canvas diagonal length.
  const rad = (b.gradientAngle * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.max(w, h);
  const dx = (Math.cos(rad) * len) / 2;
  const dy = (Math.sin(rad) * len) / 2;
  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  grad.addColorStop(0, b.color);
  grad.addColorStop(1, b.color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawStripes(ctx: CanvasRenderingContext2D, w: number, h: number, b: BorderConfig): void {
  const sw = Math.max(2, Math.floor(b.stripeWidth));
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = sw * 2;
  patternCanvas.height = sw * 2;
  const pctx = patternCanvas.getContext('2d')!;
  pctx.fillStyle = b.color;
  pctx.fillRect(0, 0, sw * 2, sw * 2);
  pctx.fillStyle = b.color2;
  // Diagonal stripe: draw a rotated rect that covers half
  pctx.save();
  pctx.translate(sw, sw);
  pctx.rotate(Math.PI / 4);
  pctx.fillRect(-sw * 2, 0, sw * 4, sw);
  pctx.restore();

  const pattern = ctx.createPattern(patternCanvas, 'repeat')!;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
}
