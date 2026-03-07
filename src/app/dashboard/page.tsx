"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import NotesList from "@/components/notes/NotesList";

export default function DashboardPage(): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <Link
          href="/dashboard/notes/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          New Note
        </Link>
      </header>
      <NotesList />
    </div>
  );
}
