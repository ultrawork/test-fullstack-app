"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import NotesList from "@/components/notes/NotesList";
import Button from "@/components/ui/Button";

export default function DashboardPage(): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <Link href="/dashboard/notes/new">
          <Button>New Note</Button>
        </Link>
      </header>
      <NotesList />
    </div>
  );
}
