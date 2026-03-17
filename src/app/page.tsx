"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

interface FormState {
  title: string;
  content: string;
}

interface FormErrors {
  title?: string;
  content?: string;
}

const initialForm: FormState = { title: "", content: "" };

export default function HomePage(): React.JSX.Element {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.content.trim()) next.content = "Content is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  function resetForm(): void {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    titleRef.current?.focus();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-4xl font-bold">Notes App</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-md flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            ref={titleRef}
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={errors.title ? "title-error" : undefined}
            className="rounded border px-3 py-2"
          />
          {errors.title && (
            <p id="title-error" className="text-sm text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="content" className="text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            value={form.content}
            onChange={handleChange}
            aria-invalid={errors.content ? "true" : undefined}
            aria-describedby={errors.content ? "content-error" : undefined}
            className="rounded border px-3 py-2"
            rows={4}
          />
          {errors.content && (
            <p id="content-error" className="text-sm text-red-600">
              {errors.content}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Note
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Clear
          </button>
        </div>

        {submitted && (
          <p role="status" className="text-sm text-green-600">
            Note has been created
          </p>
        )}
      </form>
    </main>
  );
}
