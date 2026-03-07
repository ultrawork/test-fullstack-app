import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage(): React.ReactNode {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create Account
        </h1>
        <RegisterForm />
      </section>
    </main>
  );
}
