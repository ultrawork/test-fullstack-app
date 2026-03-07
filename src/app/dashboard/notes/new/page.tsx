"use client";

import type { ReactNode } from "react";
import NoteEditor from "@/components/notes/NoteEditor";

export default function NewNotePage(): ReactNode {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Note</h1>
      <NoteEditor />
    </div>
  );
}
