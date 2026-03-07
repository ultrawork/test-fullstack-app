import SwiftUI

/// Allows selecting multiple tags from available list with search and inline creation.
struct TagSelectorView: View {
    let tags: [Tag]
    @Binding var selectedIds: [String]
    var onCreate: ((String) async -> Void)?

    @State private var searchText = ""

    private var filteredTags: [Tag] {
        guard !searchText.trimmingCharacters(in: .whitespaces).isEmpty else {
            return tags
        }
        let lower = searchText.lowercased()
        return tags.filter { $0.name.lowercased().contains(lower) }
    }

    private var canCreate: Bool {
        guard onCreate != nil else { return false }
        let trimmed = searchText.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return false }
        return !tags.contains { $0.name.lowercased() == trimmed.lowercased() }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(NSLocalizedString("tag_selector_title", comment: "Tags section title"))
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)

            selectedTagsSection

            TextField(
                NSLocalizedString("tag_selector_search_placeholder", comment: "Search tags placeholder"),
                text: $searchText
            )
            .textFieldStyle(.roundedBorder)
            .accessibilityLabel(NSLocalizedString("tag_selector_search_label", comment: "Search tags input"))

            tagsList

            if canCreate {
                createButton
            }
        }
    }

    @ViewBuilder
    private var selectedTagsSection: some View {
        if !selectedIds.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 4) {
                    ForEach(selectedIds, id: \.self) { id in
                        if let tag = tags.first(where: { $0.id == id }) {
                            TagBadgeView(
                                name: tag.name,
                                color: tag.color,
                                size: .small,
                                onRemove: { toggleTag(id: id) }
                            )
                        }
                    }
                }
            }
        }
    }

    private var tagsList: some View {
        List {
            ForEach(filteredTags) { tag in
                Button {
                    toggleTag(id: tag.id)
                } label: {
                    HStack {
                        Image(systemName: selectedIds.contains(tag.id) ? "checkmark.square.fill" : "square")
                            .foregroundColor(selectedIds.contains(tag.id) ? .blue : .gray)
                        TagBadgeView(name: tag.name, color: tag.color, size: .small)
                    }
                }
                .accessibilityLabel(
                    String(
                        format: NSLocalizedString("tag_selector_toggle", comment: "Toggle tag selection"),
                        tag.name
                    )
                )
                .accessibilityValue(
                    selectedIds.contains(tag.id)
                        ? NSLocalizedString("tag_selected", comment: "Tag is selected")
                        : NSLocalizedString("tag_not_selected", comment: "Tag is not selected")
                )
            }
        }
        .listStyle(.plain)
        .frame(maxHeight: 160)
    }

    private var createButton: some View {
        Button {
            Task {
                let trimmed = searchText.trimmingCharacters(in: .whitespaces)
                await onCreate?(trimmed)
                searchText = ""
            }
        } label: {
            Label(
                String(
                    format: NSLocalizedString("tag_selector_create", comment: "Create new tag button"),
                    searchText.trimmingCharacters(in: .whitespaces)
                ),
                systemImage: "plus.circle.fill"
            )
            .font(.subheadline)
            .foregroundColor(.green)
        }
        .accessibilityLabel(
            String(
                format: NSLocalizedString("tag_selector_create_a11y", comment: "Create new tag accessibility label"),
                searchText.trimmingCharacters(in: .whitespaces)
            )
        )
    }

    private func toggleTag(id: String) {
        if let index = selectedIds.firstIndex(of: id) {
            selectedIds.remove(at: index)
        } else {
            selectedIds.append(id)
        }
    }
}
