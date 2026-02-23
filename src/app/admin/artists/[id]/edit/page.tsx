import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArtistForm from "@/components/admin/ArtistForm";

export const metadata = { title: "アーティストを編集" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArtistPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();

  if (!artist) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アーティストを編集</h1>
      <ArtistForm artist={artist} />
    </div>
  );
}
