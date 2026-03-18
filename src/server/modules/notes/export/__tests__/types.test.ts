import { describe, it, expect } from "vitest";
import {
  PdfExportOptionsSchema,
  MarkdownExportOptionsSchema,
  BulkExportFilterSchema,
  ExportPdfBodySchema,
  ExportMarkdownBodySchema,
  BulkExportBodySchema,
} from "../types";
import type {
  PdfExportOptions,
  MarkdownExportOptions,
  BulkExportFilter,
  ExportPdfBody,
  ExportMarkdownBody,
  BulkExportBody,
} from "../types";

describe("PdfExportOptionsSchema", () => {
  it("accepts valid full options", () => {
    const input: PdfExportOptions = {
      fontSize: 14,
      includeMetadata: true,
      pageSize: "A4",
    };
    const result = PdfExportOptionsSchema.parse(input);
    expect(result.fontSize).toBe(14);
    expect(result.includeMetadata).toBe(true);
    expect(result.pageSize).toBe("A4");
  });

  it("accepts empty object with defaults", () => {
    const result = PdfExportOptionsSchema.parse({});
    expect(result).toBeDefined();
  });

  it("accepts Letter page size", () => {
    const result = PdfExportOptionsSchema.parse({ pageSize: "Letter" });
    expect(result.pageSize).toBe("Letter");
  });

  it("rejects invalid page size", () => {
    expect(() =>
      PdfExportOptionsSchema.parse({ pageSize: "B5" })
    ).toThrow();
  });

  it("rejects fontSize below minimum (8)", () => {
    expect(() =>
      PdfExportOptionsSchema.parse({ fontSize: 5 })
    ).toThrow();
  });

  it("rejects fontSize above maximum (72)", () => {
    expect(() =>
      PdfExportOptionsSchema.parse({ fontSize: 100 })
    ).toThrow();
  });

  it("rejects non-number fontSize", () => {
    expect(() =>
      PdfExportOptionsSchema.parse({ fontSize: "big" })
    ).toThrow();
  });
});

describe("MarkdownExportOptionsSchema", () => {
  it("accepts valid full options", () => {
    const input: MarkdownExportOptions = {
      includeMetadata: true,
      includeFrontmatter: true,
    };
    const result = MarkdownExportOptionsSchema.parse(input);
    expect(result.includeMetadata).toBe(true);
    expect(result.includeFrontmatter).toBe(true);
  });

  it("accepts empty object", () => {
    const result = MarkdownExportOptionsSchema.parse({});
    expect(result).toBeDefined();
  });

  it("rejects non-boolean includeMetadata", () => {
    expect(() =>
      MarkdownExportOptionsSchema.parse({ includeMetadata: "yes" })
    ).toThrow();
  });
});

describe("BulkExportFilterSchema", () => {
  it("accepts valid filter with noteIds", () => {
    const input: BulkExportFilter = {
      noteIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ],
    };
    const result = BulkExportFilterSchema.parse(input);
    expect(result.noteIds).toHaveLength(2);
  });

  it("accepts filter with category and tags", () => {
    const input: BulkExportFilter = {
      category: "work",
      tags: ["important", "urgent"],
    };
    const result = BulkExportFilterSchema.parse(input);
    expect(result.category).toBe("work");
    expect(result.tags).toEqual(["important", "urgent"]);
  });

  it("accepts filter with date range", () => {
    const input: BulkExportFilter = {
      createdAfter: "2024-01-01T00:00:00Z",
      createdBefore: "2024-12-31T23:59:59Z",
    };
    const result = BulkExportFilterSchema.parse(input);
    expect(result.createdAfter).toBe("2024-01-01T00:00:00Z");
    expect(result.createdBefore).toBe("2024-12-31T23:59:59Z");
  });

  it("accepts empty filter", () => {
    const result = BulkExportFilterSchema.parse({});
    expect(result).toBeDefined();
  });

  it("rejects invalid UUID in noteIds", () => {
    expect(() =>
      BulkExportFilterSchema.parse({ noteIds: ["not-a-uuid"] })
    ).toThrow();
  });

  it("rejects invalid datetime in createdAfter", () => {
    expect(() =>
      BulkExportFilterSchema.parse({ createdAfter: "not-a-date" })
    ).toThrow();
  });
});

describe("ExportPdfBodySchema", () => {
  it("accepts valid body with noteId and options", () => {
    const input: ExportPdfBody = {
      noteId: "550e8400-e29b-41d4-a716-446655440000",
      options: { fontSize: 16, pageSize: "Letter" },
    };
    const result = ExportPdfBodySchema.parse(input);
    expect(result.noteId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.options?.fontSize).toBe(16);
  });

  it("accepts body with noteId only", () => {
    const result = ExportPdfBodySchema.parse({
      noteId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.noteId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects missing noteId", () => {
    expect(() => ExportPdfBodySchema.parse({})).toThrow();
  });

  it("rejects invalid noteId format", () => {
    expect(() =>
      ExportPdfBodySchema.parse({ noteId: "invalid" })
    ).toThrow();
  });
});

describe("ExportMarkdownBodySchema", () => {
  it("accepts valid body with noteId and options", () => {
    const input: ExportMarkdownBody = {
      noteId: "550e8400-e29b-41d4-a716-446655440000",
      options: { includeMetadata: false, includeFrontmatter: true },
    };
    const result = ExportMarkdownBodySchema.parse(input);
    expect(result.noteId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.options?.includeMetadata).toBe(false);
  });

  it("accepts body with noteId only", () => {
    const result = ExportMarkdownBodySchema.parse({
      noteId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.noteId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects missing noteId", () => {
    expect(() => ExportMarkdownBodySchema.parse({})).toThrow();
  });
});

describe("BulkExportBodySchema", () => {
  it("accepts valid body with filter and pdf format", () => {
    const input: BulkExportBody = {
      filter: { category: "work" },
      format: "pdf",
    };
    const result = BulkExportBodySchema.parse(input);
    expect(result.format).toBe("pdf");
    expect(result.filter.category).toBe("work");
  });

  it("accepts valid body with markdown format", () => {
    const input: BulkExportBody = {
      filter: { tags: ["draft"] },
      format: "markdown",
    };
    const result = BulkExportBodySchema.parse(input);
    expect(result.format).toBe("markdown");
  });

  it("accepts body with empty filter", () => {
    const result = BulkExportBodySchema.parse({
      filter: {},
      format: "pdf",
    });
    expect(result.filter).toBeDefined();
    expect(result.format).toBe("pdf");
  });

  it("rejects missing format", () => {
    expect(() =>
      BulkExportBodySchema.parse({ filter: {} })
    ).toThrow();
  });

  it("rejects invalid format", () => {
    expect(() =>
      BulkExportBodySchema.parse({ filter: {}, format: "docx" })
    ).toThrow();
  });

  it("rejects missing filter", () => {
    expect(() =>
      BulkExportBodySchema.parse({ format: "pdf" })
    ).toThrow();
  });
});
