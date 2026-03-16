'use client';

import { type TextareaHTMLAttributes, type ReactNode, useId } from 'react';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps): ReactNode {
  const id = useId();
  const errorId = `${id}-error`;
  const testId = `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        data-testid={testId}
        className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        rows={6}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
