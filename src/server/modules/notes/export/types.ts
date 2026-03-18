import { z } from "zod";

/** Zod schema for PDF export options. */
export const PdfExportOptionsSchema = z.object({
  fontSize: z.number().min(8).max(72).optional(),
  includeMetadata: z.boolean().optional(),
  pageSize: z.enum(["A4", "Letter"]).optional(),
});

/** Zod schema for Markdown export options. */
export const MarkdownExportOptionsSchema = z.object({
  includeMetadata: z.boolean().optional(),
  includeFrontmatter: z.boolean().optional(),
});

/** Zod schema for bulk export filter criteria. */
export const BulkExportFilterSchema = z.object({
  noteIds: z.array(z.string().uuid()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
});

/** Zod schema for the PDF export request body. */
export const ExportPdfBodySchema = z.object({
  noteId: z.string().uuid(),
  options: PdfExportOptionsSchema.optional(),
});

/** Zod schema for the Markdown export request body. */
export const ExportMarkdownBodySchema = z.object({
  noteId: z.string().uuid(),
  options: MarkdownExportOptionsSchema.optional(),
});

/** Zod schema for the bulk export request body. */
export const BulkExportBodySchema = z.object({
  filter: BulkExportFilterSchema,
  format: z.enum(["pdf", "markdown"]),
});

/** Options for exporting a note as PDF. */
export type PdfExportOptions = z.infer<typeof PdfExportOptionsSchema>;

/** Options for exporting a note as Markdown. */
export type MarkdownExportOptions = z.infer<typeof MarkdownExportOptionsSchema>;

/** Filter criteria for bulk note export. */
export type BulkExportFilter = z.infer<typeof BulkExportFilterSchema>;

/** Request body DTO for single-note PDF export. */
export type ExportPdfBody = z.infer<typeof ExportPdfBodySchema>;

/** Request body DTO for single-note Markdown export. */
export type ExportMarkdownBody = z.infer<typeof ExportMarkdownBodySchema>;

/** Request body DTO for bulk note export. */
export type BulkExportBody = z.infer<typeof BulkExportBodySchema>;
