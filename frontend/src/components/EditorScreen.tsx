import { useStore } from '../store';
import { ExportBar } from './ExportBar';
import { PhotoList } from './PhotoList';
import { CanvasStage } from './CanvasStage';
import { ControlsPanel } from './ControlsPanel';

export function EditorScreen() {
  const selectedId = useStore((s) => s.selectedId);
  const photo = useStore((s) => s.photos.find((p) => p.id === s.selectedId) ?? null);

  return (
    <div className="flex h-full w-full flex-col">
      <ExportBar />
      <div className="flex min-h-0 flex-1">
        <PhotoList />
        <div className="flex min-h-0 flex-1 items-center justify-center checker-bg">
          {photo ? <CanvasStage key={selectedId ?? 'none'} photo={photo} /> : null}
        </div>
        <ControlsPanel photo={photo} />
      </div>
    </div>
  );
}
