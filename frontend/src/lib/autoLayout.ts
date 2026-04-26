import type { CanvasPreset, PhotoConfig, BorderConfig } from '../types';

export function pickPresetForImage(w: number, h: number): CanvasPreset {
  const ratio = w / h;
  if (ratio > 1.4) return 'landscape';
  if (ratio < 0.85) return 'portrait';
  return 'square';
}

export function defaultBorder(): BorderConfig {
  return {
    type: 'solid',
    color: '#ffffff',
    color2: '#000000',
    gradientAngle: 45,
    blurAmount: 40,
  };
}

let idCounter = 0;
export function nextId(): string {
  idCounter += 1;
  return `p${Date.now().toString(36)}_${idCounter}`;
}

/** Decide whether this image should be split into left/right halves. */
export function splitDirectionFor(photo: PhotoConfig): 'horizontal' | null {
  const imgRatio = photo.naturalW / photo.naturalH;
  // Landscape image in portrait/square canvas → split left/right (horizontal split of the image into 2 portrait halves)
  if (imgRatio > 1.4 && photo.preset !== 'landscape') return 'horizontal';
  return null;
}

export function makeSplitPair(photo: PhotoConfig): [PhotoConfig, PhotoConfig] | null {
  if (!splitDirectionFor(photo)) return null;
  const base: Omit<PhotoConfig, 'id' | 'splitOf'> = {
    fileName: photo.fileName,
    bitmap: photo.bitmap,
    naturalW: photo.naturalW,
    naturalH: photo.naturalH,
    preset: photo.preset,
    border: { ...photo.border },
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  };
  return [
    { ...base, id: nextId(), splitOf: { sourceId: photo.id, half: 'left' } },
    { ...base, id: nextId(), splitOf: { sourceId: photo.id, half: 'right' } },
  ];
}

export async function initialPhotoConfig(file: File): Promise<PhotoConfig> {
  const bitmap = await createImageBitmap(file);
  return {
    id: nextId(),
    fileName: file.name,
    bitmap,
    naturalW: bitmap.width,
    naturalH: bitmap.height,
    preset: pickPresetForImage(bitmap.width, bitmap.height),
    border: defaultBorder(),
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    splitOf: undefined,
  };
}
