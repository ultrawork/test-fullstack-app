import Foundation

/// Service for interacting with the Tags API endpoints.
final class TagService {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    private var tagsURL: URL {
        baseURL.appendingPathComponent("api/v1/tags")
    }

    private func tagURL(id: String) -> URL {
        tagsURL.appendingPathComponent(id)
    }

    private func noteTagsURL(noteId: String) -> URL {
        baseURL
            .appendingPathComponent("api/v1/notes")
            .appendingPathComponent(noteId)
            .appendingPathComponent("tags")
    }

    private func authorizedRequest(url: URL, method: String, body: Data? = nil) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = TokenStorage.shared.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body
        return request
    }

    /// Fetch all tags for the authenticated user.
    func fetchTags() async throws -> [TagWithNoteCount] {
        let request = authorizedRequest(url: tagsURL, method: "GET")
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        let decoded = try JSONDecoder().decode(TagsResponse.self, from: data)
        return decoded.data.tags
    }

    /// Create a new tag.
    func createTag(input: CreateTagInput) async throws -> Tag {
        let body = try JSONEncoder().encode(input)
        let request = authorizedRequest(url: tagsURL, method: "POST", body: body)
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        let decoded = try JSONDecoder().decode(TagResponse.self, from: data)
        return decoded.data
    }

    /// Update an existing tag.
    func updateTag(id: String, input: UpdateTagInput) async throws -> Tag {
        let body = try JSONEncoder().encode(input)
        let request = authorizedRequest(url: tagURL(id: id), method: "PUT", body: body)
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        let decoded = try JSONDecoder().decode(TagResponse.self, from: data)
        return decoded.data
    }

    /// Delete a tag.
    func deleteTag(id: String) async throws {
        let request = authorizedRequest(url: tagURL(id: id), method: "DELETE")
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }

    /// Attach tags to a note (replaces existing tags).
    func attachTags(noteId: String, tagIds: [String]) async throws {
        let input = AttachTagsInput(tagIds: tagIds)
        let body = try JSONEncoder().encode(input)
        let request = authorizedRequest(url: noteTagsURL(noteId: noteId), method: "PUT", body: body)
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw TagServiceError.invalidResponse
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            throw TagServiceError.httpError(statusCode: httpResponse.statusCode)
        }
    }
}

enum TagServiceError: LocalizedError {
    case invalidResponse
    case httpError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return NSLocalizedString("tag_service_error_invalid_response", tableName: "TagsLocalizable", comment: "Invalid server response")
        case .httpError(let statusCode):
            return String(
                format: NSLocalizedString("tag_service_error_http", tableName: "TagsLocalizable", comment: "HTTP error"),
                statusCode
            )
        }
    }
}

/// Simple token storage. In production, use Keychain.
final class TokenStorage: @unchecked Sendable {
    static let shared = TokenStorage()
    private let lock = NSLock()
    private var _accessToken: String?
    var accessToken: String? {
        get { lock.withLock { _accessToken } }
        set { lock.withLock { _accessToken = newValue } }
    }
    private init() {}
}
