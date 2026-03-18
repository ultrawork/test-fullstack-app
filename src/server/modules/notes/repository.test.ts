import { describe, it, expect, beforeEach } from "vitest";
import {
  InMemoryNotesRepository,
  notesRepository,
  type INotesRepository,
} from "./repository";

describe("InMemoryNotesRepository", () => {
  let repo: INotesRepository;

  beforeEach(() => {
    repo = new InMemoryNotesRepository();
  });

  describe("getById", () => {
    it("returns a note by id", async () => {
      const allNotes = await repo.list();
      const first = allNotes[0];
      const found = await repo.getById(first.id);

      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
      expect(found!.title).toBe(first.title);
    });

    it("returns undefined for non-existent id", async () => {
      const result = await repo.getById("non-existent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("list", () => {
    it("returns all seed notes without filters", async () => {
      const notes = await repo.list();

      expect(notes.length).toBeGreaterThanOrEqual(3);
      expect(notes.length).toBeLessThanOrEqual(5);
    });

    it("filters by tagIds", async () => {
      const allNotes = await repo.list();
      const noteWithTags = allNotes.find((n) => n.tags.length > 0);
      expect(noteWithTags).toBeDefined();

      const tagId = noteWithTags!.tags[0].id;
      const filtered = await repo.list({ tagIds: [tagId] });

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((note) => {
        const hasTag = note.tags.some((t) => t.id === tagId);
        expect(hasTag).toBe(true);
      });
    });

    it("filters by search (title match)", async () => {
      const allNotes = await repo.list();
      const titleWord = allNotes[0].title.split(" ")[0];
      const filtered = await repo.list({ search: titleWord });

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((note) => {
        const matchesTitle = note.title
          .toLowerCase()
          .includes(titleWord.toLowerCase());
        const matchesContent = note.content
          .toLowerCase()
          .includes(titleWord.toLowerCase());
        expect(matchesTitle || matchesContent).toBe(true);
      });
    });

    it("filters by search (content match)", async () => {
      const allNotes = await repo.list();
      const contentSnippet = allNotes[0].content.substring(0, 10);
      const filtered = await repo.list({ search: contentSnippet });

      expect(filtered.length).toBeGreaterThan(0);
    });

    it("search is case-insensitive", async () => {
      const allNotes = await repo.list();
      const titleWord = allNotes[0].title.split(" ")[0];

      const lower = await repo.list({ search: titleWord.toLowerCase() });
      const upper = await repo.list({ search: titleWord.toUpperCase() });

      expect(lower.length).toBe(upper.length);
    });

    it("filters by dateFrom", async () => {
      const allNotes = await repo.list();
      const sorted = [...allNotes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const midDate = sorted[Math.floor(sorted.length / 2)].createdAt;
      const filtered = await repo.list({ dateFrom: midDate });

      filtered.forEach((note) => {
        expect(note.createdAt.getTime()).toBeGreaterThanOrEqual(
          midDate.getTime()
        );
      });
    });

    it("filters by dateTo", async () => {
      const allNotes = await repo.list();
      const sorted = [...allNotes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const midDate = sorted[Math.floor(sorted.length / 2)].createdAt;
      const filtered = await repo.list({ dateTo: midDate });

      filtered.forEach((note) => {
        expect(note.createdAt.getTime()).toBeLessThanOrEqual(
          midDate.getTime()
        );
      });
    });

    it("combines dateFrom and dateTo filters", async () => {
      const allNotes = await repo.list();
      const sorted = [...allNotes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const dateFrom = sorted[0].createdAt;
      const dateTo = sorted[sorted.length - 1].createdAt;

      const filtered = await repo.list({ dateFrom, dateTo });
      expect(filtered.length).toBe(allNotes.length);
    });

    it("combines tagIds and search filters", async () => {
      const allNotes = await repo.list();
      const noteWithTags = allNotes.find((n) => n.tags.length > 0);
      expect(noteWithTags).toBeDefined();

      const tagId = noteWithTags!.tags[0].id;
      const searchWord = noteWithTags!.title.split(" ")[0];

      const filtered = await repo.list({
        tagIds: [tagId],
        search: searchWord,
      });

      filtered.forEach((note) => {
        const hasTag = note.tags.some((t) => t.id === tagId);
        expect(hasTag).toBe(true);
      });
    });

    it("returns empty array when no notes match filters", async () => {
      const filtered = await repo.list({
        search: "xyznonexistentstringxyz123",
      });
      expect(filtered).toEqual([]);
    });
  });

  describe("search", () => {
    it("finds notes by query in title", async () => {
      const allNotes = await repo.list();
      const titleWord = allNotes[0].title.split(" ")[0];
      const results = await repo.search(titleWord);

      expect(results.length).toBeGreaterThan(0);
    });

    it("finds notes by query in content", async () => {
      const allNotes = await repo.list();
      const contentWord = allNotes[0].content.split(" ")[0];
      const results = await repo.search(contentWord);

      expect(results.length).toBeGreaterThan(0);
    });

    it("returns empty array for no match", async () => {
      const results = await repo.search("absolutelynonexistentquery999");
      expect(results).toEqual([]);
    });

    it("search is case-insensitive", async () => {
      const allNotes = await repo.list();
      const word = allNotes[0].title.split(" ")[0];

      const lower = await repo.search(word.toLowerCase());
      const upper = await repo.search(word.toUpperCase());

      expect(lower.length).toBe(upper.length);
    });
  });

  describe("seed data quality", () => {
    it("contains notes with various content types", async () => {
      const allNotes = await repo.list();
      const allContent = allNotes.map((n) => n.content).join("\n");

      expect(allContent).toMatch(/\*\*.*\*\*/);
      expect(allContent).toMatch(/\*[^*]+\*/);
      expect(allContent).toMatch(/```/);
    });

    it("contains notes with tags that have colors", async () => {
      const allNotes = await repo.list();
      const allTags = allNotes.flatMap((n) => n.tags);
      const tagWithColor = allTags.find((t) => t.color !== undefined);

      expect(tagWithColor).toBeDefined();
    });

    it("contains notes with attachments", async () => {
      const allNotes = await repo.list();
      const noteWithAttachment = allNotes.find(
        (n) => n.attachments.length > 0
      );
      expect(noteWithAttachment).toBeDefined();

      const att = noteWithAttachment!.attachments[0];
      expect(att.id).toBeDefined();
      expect(att.filename).toBeDefined();
      expect(att.mimeType).toBeDefined();
      expect(att.url).toBeDefined();
    });

    it("contains notes with emoji/unicode content", async () => {
      const allNotes = await repo.list();
      const allContent = allNotes
        .map((n) => n.title + " " + n.content)
        .join("\n");
      const hasEmoji = /[\u{1F600}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(allContent);
      expect(hasEmoji).toBe(true);
    });

    it("contains notes with list content", async () => {
      const allNotes = await repo.list();
      const allContent = allNotes.map((n) => n.content).join("\n");
      const hasList = /^[-*\d]+[.)]\s/m.test(allContent);
      expect(hasList).toBe(true);
    });
  });

  describe("exported singleton", () => {
    it("notesRepository is an instance of InMemoryNotesRepository", () => {
      expect(notesRepository).toBeInstanceOf(InMemoryNotesRepository);
    });
  });
});
