package com.notesapp.ui.tags

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import com.notesapp.R
import com.notesapp.data.model.Tag

/** Allows selecting multiple tags from available list with search and inline creation. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TagSelector(
    tags: List<Tag>,
    selectedIds: List<String>,
    onSelectionChange: (List<String>) -> Unit,
    modifier: Modifier = Modifier,
    onCreate: ((String) -> Unit)? = null,
) {
    var searchText by remember { mutableStateOf("") }
    val filteredTags = remember(tags, searchText) {
        if (searchText.isBlank()) tags
        else tags.filter { it.name.contains(searchText, ignoreCase = true) }
    }
    val canCreate = onCreate != null &&
        searchText.isNotBlank() &&
        tags.none { it.name.equals(searchText.trim(), ignoreCase = true) }

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = stringResource(R.string.tag_selector_title),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        if (selectedIds.isNotEmpty()) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                selectedIds.forEach { id ->
                    val tag = tags.find { it.id == id }
                    if (tag != null) {
                        TagBadge(
                            name = tag.name,
                            color = tag.color,
                            isSmall = true,
                            onRemove = {
                                onSelectionChange(selectedIds - id)
                            },
                        )
                    }
                }
            }
        }

        val searchDesc = stringResource(R.string.tag_selector_search_a11y)
        OutlinedTextField(
            value = searchText,
            onValueChange = { searchText = it },
            label = { Text(stringResource(R.string.tag_selector_search_placeholder)) },
            modifier = Modifier
                .fillMaxWidth()
                .semantics {
                    contentDescription = searchDesc
                },
            singleLine = true,
        )

        LazyColumn(
            modifier = Modifier.heightIn(max = 160.dp),
        ) {
            items(filteredTags, key = { it.id }) { tag ->
                val isSelected = selectedIds.contains(tag.id)
                val stateDesc = if (isSelected) stringResource(R.string.tag_selector_state_selected) else stringResource(R.string.tag_selector_state_not_selected)
                val toggleDesc = stringResource(R.string.tag_selector_toggle_a11y, tag.name)

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp)
                        .semantics {
                            contentDescription = toggleDesc
                            stateDescription = stateDesc
                        },
                ) {
                    Checkbox(
                        checked = isSelected,
                        onCheckedChange = {
                            onSelectionChange(
                                if (isSelected) selectedIds - tag.id
                                else selectedIds + tag.id,
                            )
                        },
                    )
                    TagBadge(name = tag.name, color = tag.color, isSmall = true)
                }
            }
        }

        if (canCreate) {
            val createDesc = stringResource(R.string.tag_selector_create_a11y, searchText.trim())
            TextButton(
                onClick = {
                    onCreate?.invoke(searchText.trim())
                    searchText = ""
                },
                modifier = Modifier.semantics {
                    contentDescription = createDesc
                },
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Text(stringResource(R.string.tag_selector_create, searchText.trim()))
            }
        }
    }
}
