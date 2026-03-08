package com.notesapp.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.notesapp.data.api.TagApi
import com.notesapp.data.model.AttachTagsInput
import com.notesapp.data.model.CreateTagInput
import com.notesapp.data.model.Tag
import com.notesapp.data.model.TagWithNoteCount
import com.notesapp.data.model.UpdateTagInput
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** ViewModel managing tag state and API operations. */
class TagViewModel(private val tagApi: TagApi) : ViewModel() {

    private val _tags = MutableStateFlow<List<TagWithNoteCount>>(emptyList())
    val tags: StateFlow<List<TagWithNoteCount>> = _tags.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun fetchTags() {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = tagApi.getTags()
                if (response.isSuccessful) {
                    _tags.value = response.body()?.data?.tags.orEmpty()
                } else {
                    _errorMessage.value = "Failed to fetch tags: ${response.code()}"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Failed to fetch tags"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun createTag(name: String, color: String, onSuccess: ((Tag) -> Unit)? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = tagApi.createTag(CreateTagInput(name, color))
                if (response.isSuccessful) {
                    val tag = response.body()?.data
                    if (tag != null) {
                        val newTagWithCount = TagWithNoteCount(
                            id = tag.id,
                            name = tag.name,
                            color = tag.color,
                            createdAt = tag.createdAt,
                            updatedAt = tag.updatedAt,
                            count = TagWithNoteCount.NoteCount(notes = 0),
                        )
                        _tags.value = _tags.value + newTagWithCount
                        onSuccess?.invoke(tag)
                    }
                } else {
                    _errorMessage.value = "Failed to create tag: ${response.code()}"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Failed to create tag"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun updateTag(
        id: String,
        name: String?,
        color: String?,
        onSuccess: (() -> Unit)? = null,
        onComplete: (() -> Unit)? = null,
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = tagApi.updateTag(id, UpdateTagInput(name, color))
                if (response.isSuccessful) {
                    val updatedTag = response.body()?.data
                    if (updatedTag != null) {
                        _tags.value = _tags.value.map { existing ->
                            if (existing.id == id) {
                                TagWithNoteCount(
                                    id = updatedTag.id,
                                    name = updatedTag.name,
                                    color = updatedTag.color,
                                    createdAt = updatedTag.createdAt,
                                    updatedAt = updatedTag.updatedAt,
                                    count = existing.count,
                                )
                            } else {
                                existing
                            }
                        }
                        onSuccess?.invoke()
                    }
                } else {
                    _errorMessage.value = "Failed to update tag: ${response.code()}"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Failed to update tag"
            } finally {
                _isLoading.value = false
                onComplete?.invoke()
            }
        }
    }

    fun deleteTag(id: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val response = tagApi.deleteTag(id)
                if (response.isSuccessful) {
                    _tags.value = _tags.value.filter { it.id != id }
                } else {
                    _errorMessage.value = "Failed to delete tag: ${response.code()}"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Failed to delete tag"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun attachTags(noteId: String, tagIds: List<String>) {
        viewModelScope.launch {
            try {
                tagApi.attachTags(noteId, AttachTagsInput(tagIds))
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Failed to attach tags"
            }
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }
}
