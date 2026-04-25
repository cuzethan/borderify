import type { CanvasPreset } from '../types';

export const CANVAS_PRESETS: Record<CanvasPreset, { w: number; h: number; label: string; ratio: string }> = {
  portrait: { w: 1080, h: 1350, label: 'Portrait', ratio: '4:5' },
  landscape: { w: 1080, h: 566, label: 'Landscape', ratio: '1.91:1' },
  square: { w: 1080, h: 1080, label: 'Square', ratio: '1:1' },
};

export const PRESET_ORDER: CanvasPreset[] = ['portrait', 'square', 'landscape'];
