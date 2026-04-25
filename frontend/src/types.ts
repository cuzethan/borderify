export type CanvasPreset = 'portrait' | 'landscape' | 'square';

export type BorderType = 'solid' | 'blurred' | 'gradient' | 'stripes';

export interface BorderConfig {
  type: BorderType;
  color: string;
  color2: string;
  gradientAngle: number;
  blurAmount: number;
  stripeWidth: number;
}

export type SplitHalf = 'left' | 'right' | 'top' | 'bottom';

export interface PhotoConfig {
  id: string;
  fileName: string;
  bitmap: ImageBitmap;
  naturalW: number;
  naturalH: number;
  preset: CanvasPreset;
  border: BorderConfig;
  offsetX: number;
  offsetY: number;
  scale: number;
  splitOf?: { sourceId: string; half: SplitHalf };
}
