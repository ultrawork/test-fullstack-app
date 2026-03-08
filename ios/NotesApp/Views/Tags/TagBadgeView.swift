import SwiftUI

/// Displays a tag as a colored badge with optional remove action.
struct TagBadgeView: View {
    let name: String
    let color: String
    var size: TagBadgeSize = .medium
    var onRemove: (() -> Void)?

    var body: some View {
        HStack(spacing: 4) {
            Text(name)
                .font(size == .small ? .caption2 : .caption)
                .fontWeight(.medium)

            if let onRemove {
                Button(action: onRemove) {
                    Image(systemName: "xmark")
                        .font(.system(size: size == .small ? 8 : 10, weight: .bold))
                }
                .accessibilityLabel(
                    String(
                        format: NSLocalizedString("tag_badge_remove", comment: "Remove tag action"),
                        name
                    )
                )
            }
        }
        .foregroundColor(contrastColor)
        .padding(.horizontal, size == .small ? 6 : 8)
        .padding(.vertical, size == .small ? 2 : 4)
        .background(parsedColor)
        .clipShape(Capsule())
        .accessibilityElement(children: .combine)
        .accessibilityLabel(
            String(
                format: NSLocalizedString("tag_badge_label", comment: "Tag badge label"),
                name
            )
        )
    }

    private var parsedColor: Color {
        Color(hex: color) ?? .blue
    }

    private var contrastColor: Color {
        .contrastColor(for: color)
    }
}

enum TagBadgeSize {
    case small
    case medium
}

