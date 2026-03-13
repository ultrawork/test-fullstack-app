package com.notesapp.ui.notes

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.notesapp.R

/** Form for creating or editing a note with title, content, and character counter. */
@Composable
fun NoteForm(
    modifier: Modifier = Modifier,
    initialTitle: String = "",
    initialContent: String = "",
    isEditing: Boolean = false,
    isSubmitting: Boolean = false,
    onSubmit: (title: String, content: String) -> Unit,
    onCancel: () -> Unit,
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    var title by rememberSaveable { mutableStateOf(initialTitle) }
    var content by rememberSaveable { mutableStateOf(initialContent) }
    var errorMessage by rememberSaveable { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        OutlinedTextField(
            value = title,
            onValueChange = {
                if (it.length <= 255) title = it
                errorMessage = null
            },
            label = { Text(stringResource(R.string.note_form_title_label)) },
            placeholder = { Text(stringResource(R.string.note_form_title_placeholder)) },
            isError = errorMessage != null,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("note_form_title_input")
                .semantics {
                    contentDescription = context.getString(R.string.note_form_title_input_a11y)
                    if (errorMessage != null) error(errorMessage!!)
                },
            singleLine = true,
        )

        OutlinedTextField(
            value = content,
            onValueChange = { content = it },
            label = { Text(stringResource(R.string.note_form_content_label)) },
            placeholder = { Text(stringResource(R.string.note_form_content_placeholder)) },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("note_form_content_input")
                .semantics {
                    contentDescription = context.getString(R.string.note_form_content_input_a11y)
                },
            minLines = 5,
        )

        Text(
            text = stringResource(R.string.note_form_char_count, content.length),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier
                .testTag("note_form_char_counter")
                .semantics {
                    contentDescription =
                        context.getString(R.string.note_form_char_count_a11y, content.length)
                },
        )

        if (errorMessage != null) {
            Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedButton(
                onClick = onCancel,
                modifier = Modifier.semantics {
                    contentDescription = context.getString(R.string.note_form_cancel_a11y)
                },
            ) {
                Text(stringResource(R.string.note_form_cancel))
            }

            Button(
                onClick = {
                    focusManager.clearFocus()
                    val trimmedTitle = title.trim()
                    when {
                        trimmedTitle.isEmpty() -> {
                            errorMessage = context.getString(R.string.note_form_error_title_required)
                        }
                        trimmedTitle.length > 255 -> {
                            errorMessage = context.getString(R.string.note_form_error_title_too_long)
                        }
                        else -> {
                            errorMessage = null
                            onSubmit(trimmedTitle, content)
                        }
                    }
                },
                enabled = !isSubmitting,
                modifier = Modifier
                    .testTag("note_form_submit_button")
                    .semantics {
                        contentDescription = context.getString(
                            if (isEditing) R.string.note_form_submit_update_a11y
                            else R.string.note_form_submit_create_a11y,
                        )
                    },
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                    )
                } else {
                    Text(
                        stringResource(
                            if (isEditing) R.string.note_form_update
                            else R.string.note_form_create,
                        ),
                    )
                }
            }
        }
    }
}
