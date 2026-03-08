package com.notesapp.ui.tags

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import com.notesapp.R
import com.notesapp.data.model.Tag

/** Horizontal row of tag chips for filtering notes by tag. */
@Composable
fun TagFilter(
    tags: List<Tag>,
    selectedIds: List<String>,
    onSelectionChange: (List<String>) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (tags.isEmpty()) return

    val filterSectionDesc = stringResource(R.string.tag_filter_section_a11y)
    LazyRow(
        modifier = modifier.semantics {
            contentDescription = filterSectionDesc
        },
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(tags, key = { it.id }) { tag ->
            val isSelected = selectedIds.contains(tag.id)
            val tagColor = parseHexColor(tag.color)
            val textColor = contrastColor(tag.color)
            val stateDesc = if (isSelected) stringResource(R.string.tag_filter_state_active) else stringResource(R.string.tag_filter_state_inactive)
            val toggleDesc = stringResource(R.string.tag_filter_toggle, tag.name)

            FilterChip(
                selected = isSelected,
                onClick = {
                    onSelectionChange(
                        if (isSelected) selectedIds - tag.id
                        else selectedIds + tag.id,
                    )
                },
                label = { Text(tag.name, color = textColor) },
                shape = CircleShape,
                colors = FilterChipDefaults.filterChipColors(
                    containerColor = tagColor.copy(alpha = 0.7f),
                    selectedContainerColor = tagColor,
                ),
                modifier = Modifier.semantics {
                    contentDescription = toggleDesc
                    stateDescription = stateDesc
                },
            )
        }

        if (selectedIds.isNotEmpty()) {
            item {
                val clearAllDesc = stringResource(R.string.tag_filter_clear_all_a11y)
                TextButton(
                    onClick = { onSelectionChange(emptyList()) },
                    modifier = Modifier
                        .padding(start = 4.dp)
                        .semantics {
                            contentDescription = clearAllDesc
                        },
                ) {
                    Text(stringResource(R.string.tag_filter_clear))
                }
            }
        }
    }
}
