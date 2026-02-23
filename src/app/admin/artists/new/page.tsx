import ArtistForm from "@/components/admin/ArtistForm";

export const metadata = { title: "アーティストを追加" };

export default function NewArtistPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アーティストを追加</h1>
      <ArtistForm />
    </div>
  );
}
