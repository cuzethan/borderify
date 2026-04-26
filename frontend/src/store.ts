import { create } from 'zustand';
import type { CanvasPreset, CropRect, PhotoConfig, BorderConfig } from './types';
import { initialPhotoConfig, makeSplitPair } from './lib/autoLayout';
import { clampTransform, FULL_CROP, normalizeCrop } from './lib/geometry';

export interface SavedPhoto {
  id: string;
  fileName: string;
  naturalW: number;
  naturalH: number;
  preset: CanvasPreset;
  border: BorderConfig;
  offsetX: number;
  offsetY: number;
  scale: number;
  crop?: CropRect;
  splitOf?: { sourceId: string; half: 'left' | 'right' } | null;
  imageUrl: string;
}

type EditorMode = 'move' | 'crop';

interface Store {
  user: { email: string } | null;
  photos: PhotoConfig[];
  selectedId: string | null;
  gridlinesHidden: boolean;
  editorMode: EditorMode;

  login: (email: string) => void;
  logout: () => void;

  addFiles: (files: File[]) => Promise<void>;
  removePhoto: (id: string) => void;
  selectPhoto: (id: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;

  updatePreset: (id: string, preset: CanvasPreset) => void;
  applyPresetToAll: (preset: CanvasPreset) => void;
  updateBorder: (id: string, patch: Partial<BorderConfig>) => void;
  updateTransform: (id: string, patch: { offsetX?: number; offsetY?: number; scale?: number }) => void;
  updateCrop: (id: string, crop: CropRect) => void;
  resetCrop: (id: string) => void;
  splitPhoto: (id: string) => void;
  setEditorMode: (mode: EditorMode) => void;
  toggleGridlines: () => void;
  clearAll: () => void;
  loadSavedSession: (savedPhotos: SavedPhoto[]) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  photos: [],
  selectedId: null,
  gridlinesHidden: false,
  editorMode: 'move',

  login: (email) => set({ user: { email } }),
  logout: () => set({ user: null }),

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
    set((s) => {
      const target = s.photos.find((p) => p.id === id);
      if (!target) return s;

      let mirroredPatch: { offsetX?: number; offsetY?: number; scale?: number } | null = null;
      let mirrorId: string | null = null;

      if (target.splitOf) {
        const otherHalf = target.splitOf.half === 'left' ? 'right' : 'left';
        const sibling = s.photos.find(
          (p) =>
            p.id !== target.id &&
            p.splitOf?.sourceId === target.splitOf?.sourceId &&
            p.splitOf?.half === otherHalf,
        );

        if (sibling) {
          const requestedScale = patch.scale ?? sibling.scale;
          const requestedOffsetY = patch.offsetY ?? sibling.offsetY;
          const requestedOffsetX =
            patch.offsetX !== undefined ? -patch.offsetX : sibling.offsetX;
          const clampedMirror = clampTransform(
            sibling,
            requestedOffsetX,
            requestedOffsetY,
            requestedScale,
          );
          mirrorId = sibling.id;
          mirroredPatch = {
            scale: clampedMirror.scale,
            offsetY: clampedMirror.offsetY,
            offsetX: clampedMirror.offsetX,
          };
        }
      }

      return {
        photos: s.photos.map((p) => {
          if (p.id === id) return { ...p, ...patch };
          if (mirrorId && mirroredPatch && p.id === mirrorId) return { ...p, ...mirroredPatch };
          return p;
        }),
      };
    }),

  updateCrop: (id, crop) =>
    set((s) => {
      const target = s.photos.find((p) => p.id === id);
      if (!target) return s;
      const normalized = normalizeCrop(crop);

      let mirrorId: string | null = null;
      let mirroredCrop: CropRect | null = null;

      if (target.splitOf) {
        const otherHalf = target.splitOf.half === 'left' ? 'right' : 'left';
        const sibling = s.photos.find(
          (p) =>
            p.id !== target.id &&
            p.splitOf?.sourceId === target.splitOf?.sourceId &&
            p.splitOf?.half === otherHalf,
        );
        if (sibling) {
          mirrorId = sibling.id;
          mirroredCrop = normalizeCrop({
            x: 1 - (normalized.x + normalized.w),
            y: normalized.y,
            w: normalized.w,
            h: normalized.h,
          });
        }
      }

      return {
        photos: s.photos.map((p) => {
          if (p.id === id) return { ...p, crop: normalized };
          if (mirrorId && mirroredCrop && p.id === mirrorId) return { ...p, crop: mirroredCrop };
          return p;
        }),
      };
    }),

  resetCrop: (id) =>
    set((s) => {
      const target = s.photos.find((p) => p.id === id);
      if (!target) return s;
      let mirrorId: string | null = null;
      if (target.splitOf) {
        const otherHalf = target.splitOf.half === 'left' ? 'right' : 'left';
        const sibling = s.photos.find(
          (p) =>
            p.id !== target.id &&
            p.splitOf?.sourceId === target.splitOf?.sourceId &&
            p.splitOf?.half === otherHalf,
        );
        if (sibling) mirrorId = sibling.id;
      }
      return {
        photos: s.photos.map((p) => {
          if (p.id === id) return { ...p, crop: FULL_CROP };
          if (mirrorId && p.id === mirrorId) return { ...p, crop: FULL_CROP };
          return p;
        }),
      };
    }),

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

  setEditorMode: (mode) => set({ editorMode: mode }),

  toggleGridlines: () => set((s) => ({ gridlinesHidden: !s.gridlinesHidden })),

  clearAll: () => set({ photos: [], selectedId: null }),

  loadSavedSession: async (savedPhotos) => {
    const photos = await Promise.all(
      savedPhotos.map(async (saved) => {
        const response = await fetch(saved.imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch saved image: ${saved.imageUrl}`);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        const splitHalf = saved.splitOf?.half;
        const normalizedSplitOf =
          saved.splitOf && (splitHalf === 'left' || splitHalf === 'right')
            ? { sourceId: saved.splitOf.sourceId, half: splitHalf }
            : undefined;
        return {
          id: saved.id,
          fileName: saved.fileName,
          bitmap,
          naturalW: saved.naturalW,
          naturalH: saved.naturalH,
          preset: saved.preset,
          border: saved.border,
          offsetX: saved.offsetX,
          offsetY: saved.offsetY,
          scale: saved.scale,
          crop: normalizeCrop(saved.crop),
          splitOf: normalizedSplitOf,
        } satisfies PhotoConfig;
      }),
    );

    set({
      photos,
      selectedId: photos[0]?.id ?? null,
    });
  },
}));
