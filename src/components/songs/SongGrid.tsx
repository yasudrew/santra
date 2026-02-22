import SongCard from "./SongCard";

type SongGridProps = {
  songs: any[];
};

export default function SongGrid({ songs }: SongGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
