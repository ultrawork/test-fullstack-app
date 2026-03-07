import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// Form for creating or editing a tag with name and color picker.
struct TagFormView: View {
    var initialName: String = ""
    var initialColor: String = "#3B82F6"
    var isEditing: Bool = false
    let onSubmit: (String, String) async -> Void
    let onCancel: () -> Void

    @State private var name: String = ""
    @State private var color: String = "#3B82F6"
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    private let defaultColors = [
        "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
        "#8B5CF6", "#EC4899", "#6B7280", "#14B8A6",
    ]

    var body: some View {
        VStack(spacing: 16) {
            nameField
            colorField
            errorDisplay
            actionButtons
        }
        .padding()
        .onAppear {
            name = initialName
            color = initialColor
        }
    }

    private var nameField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(NSLocalizedString("tag_form_name_label", tableName: "TagsLocalizable", comment: "Tag name label"))
                .font(.subheadline)
                .fontWeight(.medium)

            TextField(
                NSLocalizedString("tag_form_name_placeholder", tableName: "TagsLocalizable", comment: "Tag name placeholder"),
                text: $name
            )
            .textFieldStyle(.roundedBorder)
            .accessibilityLabel(NSLocalizedString("tag_form_name_a11y", tableName: "TagsLocalizable", comment: "Tag name input"))
        }
    }

    private var colorField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(NSLocalizedString("tag_form_color_label", tableName: "TagsLocalizable", comment: "Tag color label"))
                .font(.subheadline)
                .fontWeight(.medium)

            ColorPicker(
                NSLocalizedString("tag_form_color_picker", tableName: "TagsLocalizable", comment: "Color picker label"),
                selection: colorBinding
            )
            .accessibilityLabel(NSLocalizedString("tag_form_color_picker_a11y", tableName: "TagsLocalizable", comment: "Color picker accessibility"))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(defaultColors, id: \.self) { presetColor in
                        Button {
                            color = presetColor
                        } label: {
                            Circle()
                                .fill(Color(hex: presetColor) ?? .blue)
                                .frame(width: 28, height: 28)
                                .overlay(
                                    color == presetColor
                                        ? Circle().stroke(Color.primary, lineWidth: 2)
                                        : nil
                                )
                        }
                        .accessibilityLabel(
                            String(
                                format: NSLocalizedString("tag_form_select_color", tableName: "TagsLocalizable", comment: "Select preset color"),
                                presetColor
                            )
                        )
                    }
                }
            }

            TagBadgeView(name: name.isEmpty ? NSLocalizedString("tag_form_preview", tableName: "TagsLocalizable", comment: "Tag preview placeholder") : name, color: color)
        }
    }

    @ViewBuilder
    private var errorDisplay: some View {
        if let errorMessage {
            Text(errorMessage)
                .font(.caption)
                .foregroundColor(.red)
                .accessibilityLabel(
                    String(
                        format: NSLocalizedString("tag_form_error", tableName: "TagsLocalizable", comment: "Tag form error"),
                        errorMessage
                    )
                )
        }
    }

    private var actionButtons: some View {
        HStack {
            Button(NSLocalizedString("tag_form_cancel", tableName: "TagsLocalizable", comment: "Cancel button")) {
                onCancel()
            }
            .foregroundColor(.secondary)
            .accessibilityLabel(NSLocalizedString("tag_form_cancel_a11y", tableName: "TagsLocalizable", comment: "Cancel tag editing"))

            Spacer()

            Button {
                submitForm()
            } label: {
                if isSubmitting {
                    ProgressView()
                } else {
                    Text(
                        isEditing
                            ? NSLocalizedString("tag_form_update", tableName: "TagsLocalizable", comment: "Update tag button")
                            : NSLocalizedString("tag_form_create", tableName: "TagsLocalizable", comment: "Create tag button")
                    )
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isSubmitting || name.trimmingCharacters(in: .whitespaces).isEmpty)
            .accessibilityLabel(
                isEditing
                    ? NSLocalizedString("tag_form_update_a11y", tableName: "TagsLocalizable", comment: "Update tag accessibility")
                    : NSLocalizedString("tag_form_create_a11y", tableName: "TagsLocalizable", comment: "Create tag accessibility")
            )
        }
    }

    private var colorBinding: Binding<Color> {
        Binding(
            get: { Color(hex: color) ?? .blue },
            set: { newColor in
                let uiColor = UIColor(newColor)
                var r: CGFloat = 0
                var g: CGFloat = 0
                var b: CGFloat = 0
                var a: CGFloat = 0
                uiColor.getRed(&r, green: &g, blue: &b, alpha: &a)
                color = String(format: "#%02X%02X%02X", Int(r * 255), Int(g * 255), Int(b * 255))
            }
        )
    }

    private func submitForm() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else {
            errorMessage = NSLocalizedString("tag_form_error_name_required", tableName: "TagsLocalizable", comment: "Tag name required")
            return
        }
        guard trimmedName.count <= 50 else {
            errorMessage = NSLocalizedString("tag_form_error_name_too_long", tableName: "TagsLocalizable", comment: "Tag name too long")
            return
        }

        let hexPattern = /^#[0-9A-Fa-f]{6}$/
        guard color.wholeMatch(of: hexPattern) != nil else {
            errorMessage = NSLocalizedString("tag_form_error_invalid_color", tableName: "TagsLocalizable", comment: "Invalid color format")
            return
        }

        errorMessage = nil
        isSubmitting = true

        Task {
            await onSubmit(trimmedName, color)
            isSubmitting = false
        }
    }
}
