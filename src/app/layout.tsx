import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'Private, self-hosted notes application with cloud sync',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
