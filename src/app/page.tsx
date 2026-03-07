import Link from "next/link";

export default function HomePage(): React.ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl font-bold text-gray-900">Notes App</h1>
      <p className="mt-4 text-lg text-gray-600">
        Your private, organized notes with tags
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
