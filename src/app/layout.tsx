import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes App",
  description: "Private, self-hosted notes application with cloud sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200" aria-label="Главная навигация">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Главная
            </Link>
            <Link href="/favorites" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Избранное
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
