import SwiftUI

extension Color {
    private static func parseHexComponents(_ hex: String) -> (r: UInt8, g: UInt8, b: UInt8)? {
        let cleaned = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        guard cleaned.count == 6,
              let r = UInt8(cleaned.prefix(2), radix: 16),
              let g = UInt8(cleaned.dropFirst(2).prefix(2), radix: 16),
              let b = UInt8(cleaned.dropFirst(4).prefix(2), radix: 16) else {
            return nil
        }
        return (r, g, b)
    }

    /// Initializes a Color from a hex string (e.g., "#3B82F6").
    init?(hex: String) {
        guard let (r, g, b) = Color.parseHexComponents(hex) else { return nil }
        self.init(
            red: Double(r) / 255.0,
            green: Double(g) / 255.0,
            blue: Double(b) / 255.0
        )
    }

    /// Returns black or white depending on the luminance of the given hex color.
    static func contrastColor(for hex: String) -> Color {
        guard let (r, g, b) = parseHexComponents(hex) else { return .white }
        let luminance = (0.299 * Double(r) + 0.587 * Double(g) + 0.114 * Double(b)) / 255.0
        return luminance > 0.5 ? .black : .white
    }
}
