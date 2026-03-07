package com.notesapp.ui.tags

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.notesapp.R
import com.notesapp.data.model.TagWithNoteCount

/** View mode for the tag manager. */
private enum class TagManagerViewMode {
    LIST, CREATE, EDIT,
}

/** Full tag management screen with list, create, edit, and delete. */
@Composable
fun TagManagerScreen(
    viewModel: TagViewModel,
    modifier: Modifier = Modifier,
) {
    val tags by viewModel.tags.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var viewMode by remember { mutableStateOf(TagManagerViewMode.LIST) }
    var editingTag by remember { mutableStateOf<TagWithNoteCount?>(null) }
    var deletingTag by remember { mutableStateOf<TagWithNoteCount?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.fetchTags()
    }

    if (deletingTag != null) {
        AlertDialog(
            onDismissRequest = { deletingTag = null },
            title = { Text(stringResource(R.string.tag_manager_delete_title)) },
            text = {
                Text(stringResource(R.string.tag_manager_delete_message, deletingTag!!.name))
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val id = deletingTag!!.id
                        deletingTag = null
                        viewModel.deleteTag(id)
                    },
                    modifier = Modifier.semantics {
                        contentDescription = "Confirm delete tag"
                    },
                ) {
                    Text(
                        stringResource(R.string.tag_manager_delete_confirm),
                        color = MaterialTheme.colorScheme.error,
                    )
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { deletingTag = null },
                    modifier = Modifier.semantics {
                        contentDescription = "Cancel delete tag"
                    },
                ) {
                    Text(stringResource(R.string.tag_manager_delete_cancel))
                }
            },
        )
    }

    Scaffold(
        modifier = modifier,
        floatingActionButton = {
            if (viewMode == TagManagerViewMode.LIST) {
                FloatingActionButton(
                    onClick = { viewMode = TagManagerViewMode.CREATE },
                    modifier = Modifier.semantics {
                        contentDescription = "Create new tag"
                    },
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                }
            }
        },
    ) { paddingValues ->
        when (viewMode) {
            TagManagerViewMode.LIST -> {
                if (isLoading && tags.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.semantics {
                                contentDescription = "Loading tags"
                            },
                        )
                    }
                } else if (tags.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = stringResource(R.string.tag_manager_empty_title),
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                    ) {
                        items(tags, key = { it.id }) { tag ->
                            TagRow(
                                tag = tag,
                                onEdit = {
                                    editingTag = tag
                                    viewMode = TagManagerViewMode.EDIT
                                },
                                onDelete = { deletingTag = tag },
                            )
                        }
                    }
                }
            }

            TagManagerViewMode.CREATE -> {
                TagForm(
                    modifier = Modifier.padding(paddingValues),
                    isSubmitting = isSubmitting,
                    onSubmit = { name, color ->
                        isSubmitting = true
                        viewModel.createTag(name, color) {
                            isSubmitting = false
                            viewMode = TagManagerViewMode.LIST
                        }
                    },
                    onCancel = { viewMode = TagManagerViewMode.LIST },
                )
            }

            TagManagerViewMode.EDIT -> {
                editingTag?.let { tag ->
                    TagForm(
                        modifier = Modifier.padding(paddingValues),
                        initialName = tag.name,
                        initialColor = tag.color,
                        isEditing = true,
                        isSubmitting = isSubmitting,
                        onSubmit = { name, color ->
                            isSubmitting = true
                            viewModel.updateTag(tag.id, name, color)
                            isSubmitting = false
                            editingTag = null
                            viewMode = TagManagerViewMode.LIST
                        },
                        onCancel = {
                            editingTag = null
                            viewMode = TagManagerViewMode.LIST
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun TagRow(
    tag: TagWithNoteCount,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .semantics {
                contentDescription = "${tag.name}, ${tag.count.notes} notes"
            },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TagBadge(name = tag.name, color = tag.color)

        Spacer(modifier = Modifier.width(12.dp))

        Text(
            text = stringResource(R.string.tag_manager_note_count, tag.count.notes),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f),
        )

        IconButton(
            onClick = onEdit,
            modifier = Modifier.semantics {
                contentDescription = stringResource(R.string.tag_manager_edit_tag_a11y, tag.name)
            },
        ) {
            Icon(
                Icons.Default.Edit,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
            )
        }

        IconButton(
            onClick = onDelete,
            modifier = Modifier.semantics {
                contentDescription = stringResource(R.string.tag_manager_delete_tag_a11y, tag.name)
            },
        ) {
            Icon(
                Icons.Default.Delete,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error,
            )
        }
    }
}
