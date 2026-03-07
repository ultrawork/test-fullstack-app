import SwiftUI

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
            Text(NSLocalizedString("tag_form_name_label", comment: "Tag name label"))
                .font(.subheadline)
                .fontWeight(.medium)

            TextField(
                NSLocalizedString("tag_form_name_placeholder", comment: "Tag name placeholder"),
                text: $name
            )
            .textFieldStyle(.roundedBorder)
            .accessibilityLabel(NSLocalizedString("tag_form_name_a11y", comment: "Tag name input"))
        }
    }

    private var colorField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(NSLocalizedString("tag_form_color_label", comment: "Tag color label"))
                .font(.subheadline)
                .fontWeight(.medium)

            ColorPicker(
                NSLocalizedString("tag_form_color_picker", comment: "Color picker label"),
                selection: colorBinding
            )
            .accessibilityLabel(NSLocalizedString("tag_form_color_picker_a11y", comment: "Color picker accessibility"))

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
                                format: NSLocalizedString("tag_form_select_color", comment: "Select preset color"),
                                presetColor
                            )
                        )
                    }
                }
            }

            TagBadgeView(name: name.isEmpty ? NSLocalizedString("tag_form_preview", comment: "Tag preview placeholder") : name, color: color)
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
                        format: NSLocalizedString("tag_form_error", comment: "Tag form error"),
                        errorMessage
                    )
                )
        }
    }

    private var actionButtons: some View {
        HStack {
            Button(NSLocalizedString("tag_form_cancel", comment: "Cancel button")) {
                onCancel()
            }
            .foregroundColor(.secondary)
            .accessibilityLabel(NSLocalizedString("tag_form_cancel_a11y", comment: "Cancel tag editing"))

            Spacer()

            Button {
                submitForm()
            } label: {
                if isSubmitting {
                    ProgressView()
                } else {
                    Text(
                        isEditing
                            ? NSLocalizedString("tag_form_update", comment: "Update tag button")
                            : NSLocalizedString("tag_form_create", comment: "Create tag button")
                    )
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isSubmitting || name.trimmingCharacters(in: .whitespaces).isEmpty)
            .accessibilityLabel(
                isEditing
                    ? NSLocalizedString("tag_form_update_a11y", comment: "Update tag accessibility")
                    : NSLocalizedString("tag_form_create_a11y", comment: "Create tag accessibility")
            )
        }
    }

    private var colorBinding: Binding<Color> {
        Binding(
            get: { Color(hex: color) ?? .blue },
            set: { newColor in
                if let components = newColor.cgColor?.components, components.count >= 3 {
                    let r = Int(components[0] * 255)
                    let g = Int(components[1] * 255)
                    let b = Int(components[2] * 255)
                    color = String(format: "#%02X%02X%02X", r, g, b)
                }
            }
        )
    }

    private func submitForm() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else {
            errorMessage = NSLocalizedString("tag_form_error_name_required", comment: "Tag name required")
            return
        }
        guard trimmedName.count <= 50 else {
            errorMessage = NSLocalizedString("tag_form_error_name_too_long", comment: "Tag name too long")
            return
        }

        let hexPattern = /^#[0-9A-Fa-f]{6}$/
        guard color.wholeMatch(of: hexPattern) != nil else {
            errorMessage = NSLocalizedString("tag_form_error_invalid_color", comment: "Invalid color format")
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
