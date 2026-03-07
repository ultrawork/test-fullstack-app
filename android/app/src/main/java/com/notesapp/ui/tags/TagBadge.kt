package com.notesapp.ui.tags

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.notesapp.R

/** Displays a tag as a colored badge with optional remove action. */
@Composable
fun TagBadge(
    name: String,
    color: String,
    modifier: Modifier = Modifier,
    isSmall: Boolean = false,
    onRemove: (() -> Unit)? = null,
) {
    val bgColor = parseHexColor(color)
    val textColor = contrastColor(color)
    val badgeDescription = stringResource(R.string.tag_badge_label, name)

    Row(
        modifier = modifier
            .clip(CircleShape)
            .background(bgColor)
            .padding(
                horizontal = if (isSmall) 6.dp else 8.dp,
                vertical = if (isSmall) 2.dp else 4.dp,
            )
            .semantics { contentDescription = badgeDescription },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(
            text = name,
            color = textColor,
            fontSize = if (isSmall) 10.sp else 12.sp,
            fontWeight = FontWeight.Medium,
        )

        if (onRemove != null) {
            IconButton(
                onClick = onRemove,
                modifier = Modifier.size(if (isSmall) 14.dp else 18.dp),
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = stringResource(R.string.tag_badge_remove, name),
                    tint = textColor,
                    modifier = Modifier.size(if (isSmall) 10.dp else 12.dp),
                )
            }
        }
    }
}

/** Parse a hex color string (e.g. "#3B82F6") to a Compose Color. */
fun parseHexColor(hex: String): Color {
    val cleaned = hex.removePrefix("#")
    return if (cleaned.length == 6) {
        val r = cleaned.substring(0, 2).toIntOrNull(16) ?: 0
        val g = cleaned.substring(2, 4).toIntOrNull(16) ?: 0
        val b = cleaned.substring(4, 6).toIntOrNull(16) ?: 0
        Color(r, g, b)
    } else {
        Color.Blue
    }
}

/** Calculate contrast color (black or white) based on luminance. */
fun contrastColor(hex: String): Color {
    val cleaned = hex.removePrefix("#")
    if (cleaned.length != 6) return Color.White
    val r = cleaned.substring(0, 2).toIntOrNull(16) ?: 0
    val g = cleaned.substring(2, 4).toIntOrNull(16) ?: 0
    val b = cleaned.substring(4, 6).toIntOrNull(16) ?: 0
    val luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
    return if (luminance > 0.5) Color.Black else Color.White
}
