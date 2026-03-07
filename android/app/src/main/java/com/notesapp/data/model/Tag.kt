package com.notesapp.data.model

import com.google.gson.annotations.SerializedName

/** Represents a tag that can be attached to notes. */
data class Tag(
    val id: String,
    val name: String,
    val color: String,
    val createdAt: String,
    val updatedAt: String,
)

/** Tag with associated note count from the API. */
data class TagWithNoteCount(
    val id: String,
    val name: String,
    val color: String,
    val createdAt: String,
    val updatedAt: String,
    @SerializedName("_count") val count: NoteCount,
) {
    data class NoteCount(val notes: Int)
}

data class CreateTagInput(
    val name: String,
    val color: String,
)

data class UpdateTagInput(
    val name: String? = null,
    val color: String? = null,
)

data class AttachTagsInput(
    val tagIds: List<String>,
)

/** Wrapper for tags list API response. */
data class TagsApiResponse(
    val data: TagsData,
) {
    data class TagsData(val tags: List<TagWithNoteCount>)
}

/** Wrapper for single tag API response. */
data class TagApiResponse(
    val data: Tag,
)

/** Wrapper for generic success API response. */
data class MessageResponse(
    val data: MessageData,
) {
    data class MessageData(val message: String)
}
