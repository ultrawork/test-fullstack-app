import SwiftUI

/// Horizontal row of tag buttons for filtering notes.
struct TagFilterView: View {
    let tags: [Tag]
    @Binding var selectedIds: [String]

    var body: some View {
        if !tags.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(tags) { tag in
                        tagButton(for: tag)
                    }

                    if !selectedIds.isEmpty {
                        clearButton
                    }
                }
                .padding(.horizontal, 4)
            }
            .accessibilityElement(children: .contain)
            .accessibilityLabel(NSLocalizedString("tag_filter_group_label", comment: "Tag filter group"))
        }
    }

    private func tagButton(for tag: Tag) -> some View {
        let isSelected = selectedIds.contains(tag.id)

        return Button {
            toggleTag(id: tag.id)
        } label: {
            Text(tag.name)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(Color.contrastColor(for: tag.color))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(hex: tag.color) ?? .blue)
                .clipShape(Capsule())
                .overlay(
                    isSelected
                        ? Capsule().stroke(Color.primary, lineWidth: 2)
                        : nil
                )
                .opacity(isSelected ? 1.0 : 0.7)
        }
        .accessibilityLabel(
            String(
                format: NSLocalizedString("tag_filter_toggle", comment: "Toggle tag filter"),
                tag.name
            )
        )
        .accessibilityValue(
            isSelected
                ? NSLocalizedString("tag_filter_active", comment: "Filter active")
                : NSLocalizedString("tag_filter_inactive", comment: "Filter inactive")
        )
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }

    private var clearButton: some View {
        Button {
            selectedIds.removeAll()
        } label: {
            Text(NSLocalizedString("tag_filter_clear", comment: "Clear tag filter"))
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .accessibilityLabel(NSLocalizedString("tag_filter_clear_a11y", comment: "Clear all tag filters"))
    }

    private func toggleTag(id: String) {
        if let index = selectedIds.firstIndex(of: id) {
            selectedIds.remove(at: index)
        } else {
            selectedIds.append(id)
        }
    }

}
