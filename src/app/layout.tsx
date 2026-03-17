import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes App",
  description: "Private, self-hosted notes application with cloud sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <header className="flex justify-end p-4">
          <nav aria-label="Theme settings">
            <ThemeToggle />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
