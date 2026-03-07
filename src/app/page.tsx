"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import NotesPage from "@/components/notes/NotesPage";

export default function HomePage(): React.ReactElement {
  const { user, initialize } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (user) {
    return <NotesPage />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Notes App
        </h1>
        {showRegister ? (
          <RegisterForm
            onSuccess={() => {}}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm
            onSuccess={() => {}}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    </main>
  );
}
