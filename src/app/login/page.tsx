"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage(): React.ReactNode {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to your account
          </p>
        </header>
        <LoginForm onSuccess={() => router.push("/dashboard")} />
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
