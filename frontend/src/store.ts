import { create } from 'zustand';
import type { CanvasPreset, PhotoConfig, BorderConfig } from './types';
import { initialPhotoConfig, makeSplitPair } from './lib/autoLayout';

interface Store {
  photos: PhotoConfig[];
  selectedId: string | null;
  gridlinesHidden: boolean;

  addFiles: (files: File[]) => Promise<void>;
  removePhoto: (id: string) => void;
  selectPhoto: (id: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;

  updatePreset: (id: string, preset: CanvasPreset) => void;
  applyPresetToAll: (preset: CanvasPreset) => void;
  updateBorder: (id: string, patch: Partial<BorderConfig>) => void;
  updateTransform: (id: string, patch: { offsetX?: number; offsetY?: number; scale?: number }) => void;
  splitPhoto: (id: string) => void;
  toggleGridlines: () => void;
  clearAll: () => void;
}

export const useStore = create<Store>((set, get) => ({
  photos: [],
  selectedId: null,
  gridlinesHidden: false,

  addFiles: async (files) => {
    const configs = await Promise.all(files.map((f) => initialPhotoConfig(f)));
    set((s) => ({
      photos: [...s.photos, ...configs],
      selectedId: s.selectedId ?? configs[0]?.id ?? null,
    }));
  },

  removePhoto: (id) =>
    set((s) => {
      const photos = s.photos.filter((p) => p.id !== id);
      const selectedId = s.selectedId === id ? (photos[0]?.id ?? null) : s.selectedId;
      return { photos, selectedId };
    }),

  selectPhoto: (id) => set({ selectedId: id }),

  reorder: (fromIndex, toIndex) =>
    set((s) => {
      const photos = [...s.photos];
      const [moved] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, moved);
      return { photos };
    }),

  updatePreset: (id, preset) =>
    set((s) => ({
      photos: s.photos.map((p) =>
        p.id === id ? { ...p, preset, offsetX: 0, offsetY: 0, scale: 1 } : p,
      ),
    })),

  applyPresetToAll: (preset) =>
    set((s) => ({
      photos: s.photos.map((p) => ({ ...p, preset, offsetX: 0, offsetY: 0, scale: 1 })),
    })),

  updateBorder: (id, patch) =>
    set((s) => ({
      photos: s.photos.map((p) => (p.id === id ? { ...p, border: { ...p.border, ...patch } } : p)),
    })),

  updateTransform: (id, patch) =>
    set((s) => ({
      photos: s.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  splitPhoto: (id) => {
    const photo = get().photos.find((p) => p.id === id);
    if (!photo) return;
    const pair = makeSplitPair(photo);
    if (!pair) return;
    set((s) => {
      const idx = s.photos.findIndex((p) => p.id === id);
      if (idx < 0) return s;
      const photos = [...s.photos];
      photos.splice(idx, 1, pair[0], pair[1]);
      return { photos, selectedId: pair[0].id };
    });
  },

  toggleGridlines: () => set((s) => ({ gridlinesHidden: !s.gridlinesHidden })),

  clearAll: () => set({ photos: [], selectedId: null }),
}));
