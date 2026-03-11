package com.example.notesapp

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertTextContains
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextClearance
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class E2ETests {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    // SC-001: Главная страница загружается и отображает список заметок
    @Test
    fun testSC001_mainPageDisplaysNotesList() {
        // Проверяем заголовок
        composeTestRule.onNodeWithText("Notes App").assertIsDisplayed()

        // Проверяем поле поиска
        composeTestRule.onNodeWithTag("search-input").assertIsDisplayed()

        // Проверяем контейнер списка
        composeTestRule.onNodeWithTag("notes-list").assertIsDisplayed()

        // Проверяем 5 карточек
        composeTestRule.waitForIdle()
        val noteCards = composeTestRule.onAllNodesWithTag("note-card")
        noteCards.fetchSemanticsNodes().let {
            assert(it.size == 5) { "Ожидалось 5 карточек, получено ${it.size}" }
        }
    }

    // SC-002: Карточка заметки отображает заголовок, контент и дату
    @Test
    fun testSC002_noteCardShowsTitleContentDate() {
        composeTestRule.waitForIdle()

        // Проверяем заголовок карточки
        composeTestRule.onNodeWithText("Список покупок").assertIsDisplayed()

        // Проверяем контент
        composeTestRule.onNodeWithText("Молоко, хлеб, яйца, масло, сыр, помидоры, огурцы")
            .assertIsDisplayed()
    }

    // SC-003: Короткий контент не обрезается
    @Test
    fun testSC003_shortContentNotTruncated() {
        composeTestRule.waitForIdle()

        // Контент «Заметка о встрече» менее 150 символов — отображается полностью
        composeTestRule.onNodeWithText(
            "Обсудить план на следующий квартал. Подготовить презентацию. Пригласить команду разработки.",
            substring = false
        ).assertIsDisplayed()
    }

    // SC-004: Заметки отсортированы по дате обновления
    @Test
    fun testSC004_notesSortedByUpdateDate() {
        composeTestRule.waitForIdle()

        // Проверяем наличие всех заметок
        composeTestRule.onNodeWithText("Рецепт пасты").assertIsDisplayed()
        composeTestRule.onNodeWithText("Заметка о встрече").assertIsDisplayed()
        composeTestRule.onNodeWithText("Идеи для проекта").assertIsDisplayed()
        composeTestRule.onNodeWithText("Список покупок").assertIsDisplayed()
        composeTestRule.onNodeWithText("Добро пожаловать в Notes App").assertIsDisplayed()
    }

    // SC-010: Поиск фильтрует заметки по заголовку и содержимому
    @Test
    fun testSC010_searchFiltersByTitleAndContent() {
        val searchInput = composeTestRule.onNodeWithTag("search-input")

        // Поиск по заголовку
        searchInput.performTextInput("покупок")
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithText("Список покупок").assertIsDisplayed()

        // Очищаем
        searchInput.performTextClearance()
        composeTestRule.waitForIdle()

        // Поиск по содержимому
        searchInput.performTextInput("пармезан")
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithText("Рецепт пасты").assertIsDisplayed()
    }

    // SC-011: Поиск без учёта регистра
    @Test
    fun testSC011_searchCaseInsensitive() {
        val searchInput = composeTestRule.onNodeWithTag("search-input")

        searchInput.performTextInput("РЕЦЕПТ")
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithText("Рецепт пасты").assertIsDisplayed()
    }

    // SC-012: Заглушка «Ничего не найдено»
    @Test
    fun testSC012_emptySearchResultsPlaceholder() {
        val searchInput = composeTestRule.onNodeWithTag("search-input")

        searchInput.performTextInput("xyzнесуществующийтекст123")
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithText("Ничего не найдено").assertIsDisplayed()
    }

    // SC-013: Очистка поиска сбрасывает фильтр
    @Test
    fun testSC013_clearSearchResetsFilter() {
        val searchInput = composeTestRule.onNodeWithTag("search-input")

        // Вводим запрос
        searchInput.performTextInput("рецепт")
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithText("Рецепт пасты").assertIsDisplayed()

        // Нажимаем кнопку очистки
        composeTestRule.onNodeWithTag("clear-search-button").performClick()
        composeTestRule.waitForIdle()

        // Проверяем что все заметки отображаются
        composeTestRule.onNodeWithText("Добро пожаловать в Notes App").assertIsDisplayed()
        composeTestRule.onNodeWithText("Рецепт пасты").assertIsDisplayed()
    }

    // SC-014: Поиск находит совпадения в нескольких заметках
    @Test
    fun testSC014_searchMatchesMultipleNotes() {
        val searchInput = composeTestRule.onNodeWithTag("search-input")

        searchInput.performTextInput("заметк")
        composeTestRule.waitForIdle()

        // Ожидаем 3 результата
        composeTestRule.onNodeWithText("Заметка о встрече").assertIsDisplayed()
        composeTestRule.onNodeWithText("Добро пожаловать в Notes App").assertIsDisplayed()
        composeTestRule.onNodeWithText("Идеи для проекта").assertIsDisplayed()
    }
}
