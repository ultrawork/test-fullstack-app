import Link from "next/link";
import FavoriteButton from "@/components/favorites/FavoriteButton";

export default function HomePage(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold" data-testid="home-title">
        Notes App
      </h1>
      <Link
        href="/favorites"
        data-testid="home-favorites-link"
        className="text-blue-600 hover:text-blue-700 underline transition-colors"
      >
        Перейти в Избранное
      </Link>
      <div className="flex items-center gap-2 mt-4" data-testid="demo-section">
        <span className="text-gray-600">Демо:</span>
        <FavoriteButton id="demo-1" title="Демо запись" />
      </div>
    </main>
  );
}
