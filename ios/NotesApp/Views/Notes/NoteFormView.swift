import SwiftUI

/// Form for creating or editing a note with title, content, and character counter.
struct NoteFormView: View {
    var initialTitle: String = ""
    var initialContent: String = ""
    var isEditing: Bool = false
    let onSubmit: (String, String) async -> Void
    let onCancel: () -> Void

    @State private var title: String = ""
    @State private var content: String = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        VStack(spacing: 16) {
            titleField
            contentField
            characterCounter
            errorDisplay
            actionButtons
        }
        .padding()
        .onAppear {
            title = initialTitle
            content = initialContent
        }
    }

    private var titleField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(NSLocalizedString("note_form_title_label", tableName: "NoteLocalizable", comment: "Note title label"))
                .font(.subheadline)
                .fontWeight(.medium)

            TextField(
                NSLocalizedString("note_form_title_placeholder", tableName: "NoteLocalizable", comment: "Note title placeholder"),
                text: $title
            )
            .textFieldStyle(.roundedBorder)
            .accessibilityLabel(NSLocalizedString("note_form_title_a11y", tableName: "NoteLocalizable", comment: "Note title input"))
            .accessibilityIdentifier("note_form_title_field")
        }
    }

    private var contentField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(NSLocalizedString("note_form_content_label", tableName: "NoteLocalizable", comment: "Note content label"))
                .font(.subheadline)
                .fontWeight(.medium)

            TextEditor(text: $content)
                .frame(minHeight: 150)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
                .accessibilityLabel(NSLocalizedString("note_form_content_a11y", tableName: "NoteLocalizable", comment: "Note content input"))
                .accessibilityIdentifier("note_form_content_field")
        }
    }

    private var characterCounter: some View {
        Text(
            String(
                format: NSLocalizedString("note_form_char_count", tableName: "NoteLocalizable", comment: "Character count"),
                content.count
            )
        )
        .font(.caption)
        .foregroundColor(.secondary)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityLabel(
            String(
                format: NSLocalizedString("note_form_char_count_a11y", tableName: "NoteLocalizable", comment: "Character count accessibility"),
                content.count
            )
        )
        .accessibilityIdentifier("note_form_char_counter")
    }

    @ViewBuilder
    private var errorDisplay: some View {
        if let errorMessage {
            Text(errorMessage)
                .font(.caption)
                .foregroundColor(.red)
                .accessibilityLabel(
                    String(
                        format: NSLocalizedString("note_form_error", tableName: "NoteLocalizable", comment: "Note form error"),
                        errorMessage
                    )
                )
        }
    }

    private var actionButtons: some View {
        HStack {
            Button(NSLocalizedString("note_form_cancel", tableName: "NoteLocalizable", comment: "Cancel button")) {
                onCancel()
            }
            .foregroundColor(.secondary)
            .accessibilityLabel(NSLocalizedString("note_form_cancel_a11y", tableName: "NoteLocalizable", comment: "Cancel note editing"))
            .accessibilityIdentifier("note_form_cancel_button")

            Spacer()

            Button {
                submitForm()
            } label: {
                if isSubmitting {
                    ProgressView()
                } else {
                    Text(
                        isEditing
                            ? NSLocalizedString("note_form_update", tableName: "NoteLocalizable", comment: "Update note button")
                            : NSLocalizedString("note_form_create", tableName: "NoteLocalizable", comment: "Create note button")
                    )
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isSubmitting || title.trimmingCharacters(in: .whitespaces).isEmpty)
            .accessibilityLabel(
                isEditing
                    ? NSLocalizedString("note_form_update_a11y", tableName: "NoteLocalizable", comment: "Update note accessibility")
                    : NSLocalizedString("note_form_create_a11y", tableName: "NoteLocalizable", comment: "Create note accessibility")
            )
            .accessibilityIdentifier("note_form_submit_button")
        }
    }

    private func submitForm() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else {
            errorMessage = NSLocalizedString("note_form_error_title_required", tableName: "NoteLocalizable", comment: "Title required")
            return
        }
        guard trimmedTitle.count <= 255 else {
            errorMessage = NSLocalizedString("note_form_error_title_too_long", tableName: "NoteLocalizable", comment: "Title too long")
            return
        }

        errorMessage = nil
        isSubmitting = true

        Task {
            await onSubmit(trimmedTitle, content)
            if !Task.isCancelled {
                isSubmitting = false
            }
        }
    }
}
