import JSZip from 'jszip';
import type { PhotoConfig } from '../types';
import { canvasToBlob, renderPhotoToCanvas } from './render';

export async function exportAll(photos: PhotoConfig[]): Promise<Blob> {
  const zip = new JSZip();
  const offCanvas = document.createElement('canvas');
  const ctx = offCanvas.getContext('2d')!;
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    renderPhotoToCanvas(photo, ctx, offCanvas);
    const blob = await canvasToBlob(offCanvas, 'image/jpeg', 1.0);
    const stem = photo.fileName.replace(/\.[^.]+$/, '');
    const idx = String(i + 1).padStart(2, '0');
    zip.file(`${idx}_${stem}.jpg`, blob);
  }
  return zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
