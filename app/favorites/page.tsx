import { Navbar } from "@/components/layout/navbar";
import { FavoritesView } from "@/components/favorites/favorites-view";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen pb-10">
      <Navbar />
      <FavoritesView />
    </main>
  );
}
