'use client';

import { type ReactNode } from 'react';
import { NoteEditor } from '@/components/notes/NoteEditor';

export default function NewNotePage(): ReactNode {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Note</h1>
      <NoteEditor />
    </div>
  );
}
