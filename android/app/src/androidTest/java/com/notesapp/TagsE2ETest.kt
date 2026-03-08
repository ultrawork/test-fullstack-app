package com.notesapp

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextClearance
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * E2E тесты для системы тегов Android (Jetpack Compose)
 */
@RunWith(AndroidJUnit4::class)
class TagsE2ETest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    // SC-020: Создание нового тега
    @Test
    fun testSC020_createNewTag() {
        // Нажимаем кнопку создания нового тега (FAB)
        composeTestRule
            .onNodeWithTag("tag_manager_create_fab")
            .assertIsDisplayed()
            .performClick()

        // Заполняем имя тега
        composeTestRule
            .onNodeWithTag("tag_form_name_input")
            .assertIsDisplayed()
            .performTextInput("Работа")

        // Выбираем цвет
        composeTestRule
            .onNodeWithTag("tag_form_color_#3B82F6")
            .performClick()

        // Нажимаем кнопку создания
        composeTestRule
            .onNodeWithTag("tag_form_submit_button")
            .assertIsDisplayed()
            .performClick()

        // Проверяем что тег появился в списке
        composeTestRule
            .onNodeWithText("Работа")
            .assertIsDisplayed()
    }

    // SC-021: Создание тега с невалидными данными
    @Test
    fun testSC021_createTagWithEmptyName() {
        // Открываем форму создания
        composeTestRule
            .onNodeWithTag("tag_manager_create_fab")
            .performClick()

        // Кнопка должна быть задизейблена при пустом имени
        composeTestRule
            .onNodeWithTag("tag_form_submit_button")
            .assertIsNotEnabled()
    }

    // SC-022: Редактирование тега
    @Test
    fun testSC022_editTag() {
        // Создаём тег
        composeTestRule
            .onNodeWithTag("tag_manager_create_fab")
            .performClick()

        composeTestRule
            .onNodeWithTag("tag_form_name_input")
            .performTextInput("Работа")

        composeTestRule
            .onNodeWithTag("tag_form_submit_button")
            .performClick()

        // Ждём появления тега в списке
        composeTestRule
            .onNodeWithText("Работа")
            .assertIsDisplayed()

        // Нажимаем Edit на тега
        composeTestRule
            .onNodeWithTag("tag_manager_edit_Работа")
            .performClick()

        // Изменяем имя
        composeTestRule
            .onNodeWithTag("tag_form_name_input")
            .performTextClearance()

        composeTestRule
            .onNodeWithTag("tag_form_name_input")
            .performTextInput("Личное")

        // Сохраняем
        composeTestRule
            .onNodeWithTag("tag_form_submit_button")
            .performClick()

        // Проверяем обновлённый тег
        composeTestRule
            .onNodeWithText("Личное")
            .assertIsDisplayed()
    }

    // SC-023: Удаление тега
    @Test
    fun testSC023_deleteTag() {
        // Создаём тег
        composeTestRule
            .onNodeWithTag("tag_manager_create_fab")
            .performClick()

        composeTestRule
            .onNodeWithTag("tag_form_name_input")
            .performTextInput("Личное")

        composeTestRule
            .onNodeWithTag("tag_form_submit_button")
            .performClick()

        composeTestRule
            .onNodeWithText("Личное")
            .assertIsDisplayed()

        // Нажимаем Delete
        composeTestRule
            .onNodeWithTag("tag_manager_delete_Личное")
            .performClick()

        // Подтверждаем удаление
        composeTestRule
            .onNodeWithTag("tag_manager_confirm_delete")
            .performClick()

        // Проверяем что тег удалён
        composeTestRule
            .onNodeWithText("Личное")
            .assertDoesNotExist()
    }

    // SC-025: Отображение списка тегов
    @Test
    fun testSC025_tagManagerDisplaysTags() {
        // Проверяем что экран менеджера загружается
        // Должно быть либо пустое состояние, либо список тегов
        val emptyState = composeTestRule
            .onNodeWithTag("tag_manager_empty_state")

        val tagList = composeTestRule
            .onNodeWithTag("tag_manager_list")

        // Один из двух должен отображаться
        try {
            emptyState.assertIsDisplayed()
        } catch (_: AssertionError) {
            tagList.assertIsDisplayed()
        }
    }
}
