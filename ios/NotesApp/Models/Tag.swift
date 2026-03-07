import Foundation

/// Represents a tag that can be attached to notes.
struct Tag: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let color: String
    let createdAt: String
    let updatedAt: String
}

/// Tag with associated note count from the API.
struct TagWithNoteCount: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let color: String
    let createdAt: String
    let updatedAt: String
    let count: NoteCount

    enum CodingKeys: String, CodingKey {
        case id, name, color, createdAt, updatedAt
        case count = "_count"
    }

    struct NoteCount: Codable, Hashable {
        let notes: Int
    }
}

struct CreateTagInput: Codable {
    let name: String
    let color: String
}

struct UpdateTagInput: Codable {
    let name: String?
    let color: String?
}

struct AttachTagsInput: Codable {
    let tagIds: [String]
}

struct TagsResponse: Codable {
    let data: TagsData

    struct TagsData: Codable {
        let tags: [TagWithNoteCount]
    }
}

struct TagResponse: Codable {
    let data: Tag
}
