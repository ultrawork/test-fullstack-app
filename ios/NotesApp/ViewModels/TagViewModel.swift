import Foundation
import SwiftUI

/// ViewModel for tag management operations.
@MainActor
final class TagViewModel: ObservableObject {
    @Published var tags: [TagWithNoteCount] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let tagService: TagService

    init(tagService: TagService) {
        self.tagService = tagService
    }

    func fetchTags() async {
        isLoading = true
        errorMessage = nil
        do {
            tags = try await tagService.fetchTags()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func createTag(name: String, color: String) async -> Tag? {
        isLoading = true
        errorMessage = nil
        do {
            let input = CreateTagInput(name: name, color: color)
            let tag = try await tagService.createTag(input: input)
            let newTagWithCount = TagWithNoteCount(
                id: tag.id,
                name: tag.name,
                color: tag.color,
                createdAt: tag.createdAt,
                updatedAt: tag.updatedAt,
                count: TagWithNoteCount.NoteCount(notes: 0)
            )
            tags.append(newTagWithCount)
            isLoading = false
            return tag
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }

    func updateTag(id: String, name: String?, color: String?) async {
        isLoading = true
        errorMessage = nil
        do {
            let input = UpdateTagInput(name: name, color: color)
            let updatedTag = try await tagService.updateTag(id: id, input: input)
            if let index = tags.firstIndex(where: { $0.id == id }) {
                let existingCount = tags[index].count
                tags[index] = TagWithNoteCount(
                    id: updatedTag.id,
                    name: updatedTag.name,
                    color: updatedTag.color,
                    createdAt: updatedTag.createdAt,
                    updatedAt: updatedTag.updatedAt,
                    count: existingCount
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func deleteTag(id: String) async {
        isLoading = true
        errorMessage = nil
        do {
            try await tagService.deleteTag(id: id)
            tags.removeAll { $0.id == id }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func attachTags(noteId: String, tagIds: [String]) async {
        do {
            try await tagService.attachTags(noteId: noteId, tagIds: tagIds)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func clearError() {
        errorMessage = nil
    }
}
