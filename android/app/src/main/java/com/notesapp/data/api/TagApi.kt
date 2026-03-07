package com.notesapp.data.api

import com.notesapp.data.model.AttachTagsInput
import com.notesapp.data.model.CreateTagInput
import com.notesapp.data.model.MessageResponse
import com.notesapp.data.model.TagApiResponse
import com.notesapp.data.model.TagsApiResponse
import com.notesapp.data.model.UpdateTagInput
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/** Retrofit API interface for tag operations. */
interface TagApi {

    @GET("api/v1/tags")
    suspend fun getTags(): Response<TagsApiResponse>

    @POST("api/v1/tags")
    suspend fun createTag(@Body input: CreateTagInput): Response<TagApiResponse>

    @PUT("api/v1/tags/{id}")
    suspend fun updateTag(
        @Path("id") id: String,
        @Body input: UpdateTagInput,
    ): Response<TagApiResponse>

    @DELETE("api/v1/tags/{id}")
    suspend fun deleteTag(@Path("id") id: String): Response<MessageResponse>

    @PUT("api/v1/notes/{noteId}/tags")
    suspend fun attachTags(
        @Path("noteId") noteId: String,
        @Body input: AttachTagsInput,
    ): Response<Unit>
}
