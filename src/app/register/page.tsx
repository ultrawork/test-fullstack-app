"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage(): React.ReactNode {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Start organizing your notes today
          </p>
        </header>
        <RegisterForm onSuccess={() => router.push("/dashboard")} />
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
