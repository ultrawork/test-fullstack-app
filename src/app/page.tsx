import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main data-testid="landing-page" className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Notes App</h1>
        <p className="mt-3 text-lg text-gray-600">A private, self-hosted notes application.</p>
      </header>
      <section className="mt-8 flex gap-4">
        <Link
          href="/login"
          data-testid="sign-in-link"
          className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          data-testid="create-account-link"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
        >
          Create account
        </Link>
      </section>
    </main>
  );
}
