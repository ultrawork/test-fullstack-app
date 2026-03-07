import SwiftUI

/// Full tag management view with list, create, edit, and delete functionality.
struct TagManagerView: View {
    @ObservedObject var viewModel: TagViewModel
    @State private var currentView: TagManagerViewMode = .list
    @State private var editingTag: TagWithNoteCount?
    @State private var deletingTag: TagWithNoteCount?
    @State private var showDeleteConfirmation = false

    var body: some View {
        NavigationStack {
            Group {
                switch currentView {
                case .list:
                    listView
                case .create:
                    TagFormView(
                        onSubmit: { name, color in
                            await viewModel.createTag(name: name, color: color)
                            currentView = .list
                        },
                        onCancel: { currentView = .list }
                    )
                case .edit:
                    if let tag = editingTag {
                        TagFormView(
                            initialName: tag.name,
                            initialColor: tag.color,
                            isEditing: true,
                            onSubmit: { name, color in
                                await viewModel.updateTag(id: tag.id, name: name, color: color)
                                editingTag = nil
                                currentView = .list
                            },
                            onCancel: {
                                editingTag = nil
                                currentView = .list
                            }
                        )
                    }
                }
            }
            .navigationTitle(NSLocalizedString("tag_manager_title", tableName: "TagsLocalizable", comment: "Tag manager title"))
            .toolbar {
                if currentView == .list {
                    ToolbarItem(placement: .primaryAction) {
                        Button {
                            currentView = .create
                        } label: {
                            Image(systemName: "plus")
                        }
                        .accessibilityLabel(NSLocalizedString("tag_manager_create_new", tableName: "TagsLocalizable", comment: "Create new tag"))
                    }
                }
            }
            .alert(
                NSLocalizedString("tag_manager_delete_title", tableName: "TagsLocalizable", comment: "Delete confirmation title"),
                isPresented: $showDeleteConfirmation,
                presenting: deletingTag
            ) { tag in
                Button(
                    NSLocalizedString("tag_manager_delete_confirm", tableName: "TagsLocalizable", comment: "Delete tag button"),
                    role: .destructive
                ) {
                    Task {
                        await viewModel.deleteTag(id: tag.id)
                        deletingTag = nil
                    }
                }
                Button(
                    NSLocalizedString("tag_manager_delete_cancel", tableName: "TagsLocalizable", comment: "Cancel delete"),
                    role: .cancel
                ) {
                    deletingTag = nil
                }
            } message: { tag in
                Text(
                    String(
                        format: NSLocalizedString("tag_manager_delete_message", tableName: "TagsLocalizable", comment: "Delete confirmation message"),
                        tag.name
                    )
                )
            }
            .task {
                await viewModel.fetchTags()
            }
        }
    }

    private var listView: some View {
        Group {
            if viewModel.isLoading && viewModel.tags.isEmpty {
                ProgressView()
                    .accessibilityLabel(NSLocalizedString("tag_manager_loading", tableName: "TagsLocalizable", comment: "Loading tags"))
            } else if viewModel.tags.isEmpty {
                ContentUnavailableView(
                    NSLocalizedString("tag_manager_empty_title", tableName: "TagsLocalizable", comment: "No tags title"),
                    systemImage: "tag",
                    description: Text(NSLocalizedString("tag_manager_empty_description", tableName: "TagsLocalizable", comment: "No tags description"))
                )
            } else {
                List {
                    ForEach(viewModel.tags) { tag in
                        tagRow(for: tag)
                    }
                }
                .listStyle(.insetGrouped)
            }
        }
    }

    private func tagRow(for tag: TagWithNoteCount) -> some View {
        HStack {
            TagBadgeView(name: tag.name, color: tag.color)

            Spacer()

            Text(
                String(
                    format: NSLocalizedString("tag_manager_note_count", tableName: "TagsLocalizable", comment: "Note count for tag"),
                    tag.count.notes
                )
            )
            .font(.caption)
            .foregroundColor(.secondary)
        }
        .swipeActions(edge: .trailing) {
            Button(role: .destructive) {
                deletingTag = tag
                showDeleteConfirmation = true
            } label: {
                Label(
                    NSLocalizedString("tag_manager_delete_action", tableName: "TagsLocalizable", comment: "Delete swipe action"),
                    systemImage: "trash"
                )
            }
            .accessibilityLabel(
                String(
                    format: NSLocalizedString("tag_manager_delete_tag_a11y", tableName: "TagsLocalizable", comment: "Delete tag accessibility"),
                    tag.name
                )
            )
        }
        .swipeActions(edge: .leading) {
            Button {
                editingTag = tag
                currentView = .edit
            } label: {
                Label(
                    NSLocalizedString("tag_manager_edit_action", tableName: "TagsLocalizable", comment: "Edit swipe action"),
                    systemImage: "pencil"
                )
            }
            .tint(.blue)
            .accessibilityLabel(
                String(
                    format: NSLocalizedString("tag_manager_edit_tag_a11y", tableName: "TagsLocalizable", comment: "Edit tag accessibility"),
                    tag.name
                )
            )
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(
            String(
                format: NSLocalizedString("tag_manager_tag_row_a11y", tableName: "TagsLocalizable", comment: "Tag row accessibility"),
                tag.name,
                tag.count.notes
            )
        )
    }
}

private enum TagManagerViewMode {
    case list
    case create
    case edit
}
