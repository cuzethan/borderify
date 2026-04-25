import { useStore } from './store';
import { UploadScreen } from './components/UploadScreen';
import { EditorScreen } from './components/EditorScreen';

export function App() {
  const photos = useStore((s) => s.photos);
  return (
    <div className="h-full w-full">
      {photos.length === 0 ? <UploadScreen /> : <EditorScreen />}
    </div>
  );
}