import { createClient } from "@/lib/supabase/server";
import SongForm from "@/components/admin/SongForm";

export const metadata = { title: "楽曲を追加" };

export default async function NewSongPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase.from("artists").select("id, name").order("name");
  const { data: albums } = await supabase.from("albums").select("id, title").order("title");
  const { data: tags } = await supabase.from("tags").select("*").order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">楽曲を追加</h1>
      <SongForm
        artists={artists || []}
        albums={albums || []}
        tags={tags || []}
      />
    </div>
  );
}
