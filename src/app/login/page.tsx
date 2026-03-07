import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage(): React.ReactNode {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign In
        </h1>
        <LoginForm />
      </section>
    </main>
  );
}
