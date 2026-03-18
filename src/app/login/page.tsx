"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

interface FormErrors {
  email?: string;
  password?: string;
}

/** Login page with email/password form */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  function validate(): FormErrors {
    const errors: FormErrors = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    return errors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    clearError();

    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await login({ email: email.trim(), password });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <section className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign in
        </h1>

        {error && (
          <div role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Login form" noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="email"
              aria-describedby={formErrors.email ? "email-error" : undefined}
              aria-invalid={!!formErrors.email}
            />
            {formErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {formErrors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="current-password"
              aria-describedby={formErrors.password ? "password-error" : undefined}
              aria-invalid={!!formErrors.password}
            />
            {formErrors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {formErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
