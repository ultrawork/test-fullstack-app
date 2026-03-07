package com.notesapp.ui.tags

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.notesapp.R

private val DEFAULT_COLORS = listOf(
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
    "#8B5CF6", "#EC4899", "#6B7280", "#14B8A6",
)

private val HEX_COLOR_REGEX = Regex("^#[0-9A-Fa-f]{6}$")

/** Form for creating or editing a tag with name and color picker. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TagForm(
    modifier: Modifier = Modifier,
    initialName: String = "",
    initialColor: String = "#3B82F6",
    isEditing: Boolean = false,
    isSubmitting: Boolean = false,
    onSubmit: (name: String, color: String) -> Unit,
    onCancel: () -> Unit,
) {
    var name by remember { mutableStateOf(initialName) }
    var color by remember { mutableStateOf(initialColor) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        OutlinedTextField(
            value = name,
            onValueChange = {
                if (it.length <= 50) name = it
                errorMessage = null
            },
            label = { Text(stringResource(R.string.tag_form_name_label)) },
            placeholder = { Text(stringResource(R.string.tag_form_name_placeholder)) },
            isError = errorMessage != null,
            modifier = Modifier
                .fillMaxWidth()
                .semantics {
                    contentDescription = "Tag name input"
                    if (errorMessage != null) error(errorMessage!!)
                },
            singleLine = true,
        )

        Text(
            text = stringResource(R.string.tag_form_color_label),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            DEFAULT_COLORS.forEach { presetColor ->
                val isSelected = color == presetColor
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(parseHexColor(presetColor))
                        .then(
                            if (isSelected) Modifier.border(2.dp, Color.Black, CircleShape)
                            else Modifier,
                        )
                        .clickable { color = presetColor }
                        .semantics {
                            contentDescription =
                                stringResource(R.string.tag_form_select_color, presetColor)
                        },
                )
            }
        }

        TagBadge(
            name = name.ifBlank { stringResource(R.string.tag_form_preview) },
            color = color,
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
                    contentDescription = "Cancel tag editing"
                },
            ) {
                Text(stringResource(R.string.tag_form_cancel))
            }

            Button(
                onClick = {
                    val trimmedName = name.trim()
                    when {
                        trimmedName.isEmpty() -> {
                            errorMessage = "Tag name is required"
                        }
                        trimmedName.length > 50 -> {
                            errorMessage = "Tag name must be at most 50 characters"
                        }
                        !HEX_COLOR_REGEX.matches(color) -> {
                            errorMessage = "Invalid color format"
                        }
                        else -> {
                            errorMessage = null
                            onSubmit(trimmedName, color)
                        }
                    }
                },
                enabled = !isSubmitting,
                modifier = Modifier.semantics {
                    contentDescription = if (isEditing) "Update tag" else "Create tag"
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
                            if (isEditing) R.string.tag_form_update
                            else R.string.tag_form_create,
                        ),
                    )
                }
            }
        }
    }
}
