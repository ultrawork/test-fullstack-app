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
        let hex = color.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        guard hex.count == 6,
              let r = UInt8(hex.prefix(2), radix: 16),
              let g = UInt8(hex.dropFirst(2).prefix(2), radix: 16),
              let b = UInt8(hex.dropFirst(4).prefix(2), radix: 16) else {
            return .white
        }
        let luminance = (0.299 * Double(r) + 0.587 * Double(g) + 0.114 * Double(b)) / 255.0
        return luminance > 0.5 ? .black : .white
    }
}

enum TagBadgeSize {
    case small
    case medium
}

extension Color {
    init?(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        guard cleaned.count == 6,
              let r = UInt8(cleaned.prefix(2), radix: 16),
              let g = UInt8(cleaned.dropFirst(2).prefix(2), radix: 16),
              let b = UInt8(cleaned.dropFirst(4).prefix(2), radix: 16) else {
            return nil
        }
        self.init(
            red: Double(r) / 255.0,
            green: Double(g) / 255.0,
            blue: Double(b) / 255.0
        )
    }
}
