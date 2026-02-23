import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SongForm from "@/components/admin/SongForm";

export const metadata = { title: "楽曲を編集" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: song } = await supabase
    .from("songs")
    .select("*, song_tags(tag_id)")
    .eq("id", id)
    .single();

  if (!song) notFound();

  const { data: artists } = await supabase.from("artists").select("id, name").order("name");
  const { data: albums } = await supabase.from("albums").select("id, title").order("title");
  const { data: tags } = await supabase.from("tags").select("*").order("name");

  const selectedTagIds = song.song_tags?.map((st: any) => st.tag_id) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">楽曲を編集</h1>
      <SongForm
        song={song}
        artists={artists || []}
        albums={albums || []}
        tags={tags || []}
        selectedTagIds={selectedTagIds}
      />
    </div>
  );
}
