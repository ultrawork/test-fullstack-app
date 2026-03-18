/** File attachment associated with a note. */
export interface Attachment {
  /** Unique identifier. */
  readonly id: string;
  /** Attachment category (e.g. "image", "document", "video"). */
  readonly type: string;
  /** Original file name. */
  readonly filename: string;
  /** MIME type (e.g. "image/png", "application/pdf"). */
  readonly mimeType: string;
  /** File size in bytes. */
  readonly size: number;
  /** URL to the full file. */
  readonly url: string;
  /** Optional URL to a preview/thumbnail. */
  readonly previewUrl?: string;
  /** Timestamp when the attachment was created. */
  readonly createdAt: Date;
}

/** Tag that can be applied to a note. */
export interface Tag {
  /** Unique identifier. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
  /** Optional hex color (e.g. "#ff0000"). */
  readonly color?: string;
}

/** A note with rich content, tags, and attachments. */
export interface Note {
  /** Unique identifier. */
  readonly id: string;
  /** Note title. */
  readonly title: string;
  /** Note body content. */
  readonly content: string;
  /** Tags applied to this note. */
  readonly tags: ReadonlyArray<Tag>;
  /** Files attached to this note. */
  readonly attachments: ReadonlyArray<Attachment>;
  /** Timestamp when the note was created. */
  readonly createdAt: Date;
  /** Timestamp when the note was last updated. */
  readonly updatedAt: Date;
}
