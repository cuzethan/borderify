// ...existing code...
import { EditorScreen } from "../components/EditorScreen";
import { UploadScreen } from "../components/UploadScreen";
import { useStore } from "../store";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data: { user } } = await supabase.auth.getUser();

console.log(user);


export function AppPage() {
    const photos = useStore((s) => s.photos);
    return (
        <div className="h-full w-full">
            {photos.length === 0 ? <UploadScreen /> : <EditorScreen />}
        </div>
    );
}