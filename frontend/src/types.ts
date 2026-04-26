export type CanvasPreset = 'portrait' | 'landscape' | 'square';

export type BorderType = 'solid' | 'blurred' | 'gradient';

export interface BorderConfig {
  type: BorderType;
  color: string;
  color2: string;
  gradientAngle: number;
  blurAmount: number;
}

export type SplitHalf = 'left' | 'right';

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

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
  crop: CropRect;
  splitOf?: { sourceId: string; half: SplitHalf };
}
