package com.example.testfullstackapp

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsNotDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * E2E-тесты для функциональности архива записей
 */
@RunWith(AndroidJUnit4::class)
class ArchiveE2ETests {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    // MARK: - Навигация

    /** SC-001: Отображение навигационной панели с ссылками «Главная» и «Архив» */
    @Test
    fun testSC001_NavigationBarDisplayed() {
        composeTestRule.onNodeWithTag("nav-home").assertIsDisplayed()
        composeTestRule.onNodeWithTag("nav-archive").assertIsDisplayed()
    }

    /** SC-002: Навигация между главной и архивом */
    @Test
    fun testSC002_NavigationBetweenPages() {
        // Переход на архив
        composeTestRule.onNodeWithTag("nav-archive").performClick()
        composeTestRule.onNodeWithTag("archive-title").assertIsDisplayed()

        // Возврат на главную
        composeTestRule.onNodeWithTag("nav-home").performClick()
        composeTestRule.onNodeWithTag("home-title").assertIsDisplayed()
    }

    /** SC-003: Главная страница содержит заголовок, ссылку на архив и демо-секцию */
    @Test
    fun testSC003_HomePageStructure() {
        composeTestRule.onNodeWithTag("home-title").assertIsDisplayed()
        composeTestRule.onNodeWithTag("home-archive-link").assertIsDisplayed()
        composeTestRule.onNodeWithTag("demo-section").assertIsDisplayed()
        composeTestRule.onNodeWithTag("archive-button-demo-1").assertIsDisplayed()
    }

    /** SC-004: Ссылка «Перейти в Архив» ведёт на страницу архива */
    @Test
    fun testSC004_HomeArchiveLinkNavigation() {
        composeTestRule.onNodeWithTag("home-archive-link").performClick()
        composeTestRule.onNodeWithTag("archive-title").assertIsDisplayed()
    }

    // MARK: - UI архива

    /** SC-201: Страница архива — пустое состояние */
    @Test
    fun testSC201_ArchiveEmptyState() {
        composeTestRule.onNodeWithTag("nav-archive").performClick()

        composeTestRule.onNodeWithTag("archive-title").assertIsDisplayed()
        composeTestRule.onNodeWithTag("empty-archive").assertIsDisplayed()
        composeTestRule.onNodeWithText("Архив пуст").assertIsDisplayed()
        composeTestRule.onNodeWithText("Архивируйте записи, чтобы они появились здесь").assertIsDisplayed()
    }

    /** SC-202: Архивация записи через демо-кнопку */
    @Test
    fun testSC202_ArchiveNoteViaDemoButton() {
        // Нажимаем кнопку архивации
        composeTestRule.onNodeWithTag("archive-button-demo-1").performClick()

        // Переходим в архив
        composeTestRule.onNodeWithTag("nav-archive").performClick()

        // Проверяем карточку
        composeTestRule.onNodeWithTag("archive-card-demo-1").assertIsDisplayed()
        composeTestRule.onNodeWithText("Демо запись").assertIsDisplayed()
    }

    /** SC-203: Восстановление записи из архива */
    @Test
    fun testSC203_RestoreNoteFromArchive() {
        // Архивируем запись
        composeTestRule.onNodeWithTag("archive-button-demo-1").performClick()

        // Переходим в архив
        composeTestRule.onNodeWithTag("nav-archive").performClick()
        composeTestRule.onNodeWithTag("archive-card-demo-1").assertIsDisplayed()

        // Восстанавливаем
        composeTestRule.onNodeWithTag("restore-note-demo-1").performClick()

        // Проверяем пустое состояние
        composeTestRule.onNodeWithTag("empty-archive").assertIsDisplayed()
    }

    /** SC-204: Карточка архивной записи — отображение данных */
    @Test
    fun testSC204_ArchiveCardDisplaysData() {
        // Архивируем демо-запись
        composeTestRule.onNodeWithTag("archive-button-demo-1").performClick()

        // Переходим в архив
        composeTestRule.onNodeWithTag("nav-archive").performClick()

        // Проверяем содержимое карточки
        composeTestRule.onNodeWithTag("archive-card-demo-1").assertIsDisplayed()
        composeTestRule.onNodeWithText("Демо запись").assertIsDisplayed()
        composeTestRule.onNodeWithText("Содержимое демо записи").assertIsDisplayed()
        composeTestRule.onNodeWithTag("restore-note-demo-1").assertIsDisplayed()
    }

    /** SC-205: Данные сохраняются после перезапуска (пересоздания Activity) */
    @Test
    fun testSC205_PersistenceAfterRecreation() {
        // Архивируем запись
        composeTestRule.onNodeWithTag("archive-button-demo-1").performClick()

        // Пересоздаём Activity для проверки persistence
        composeTestRule.activityRule.scenario.recreate()

        // Переходим в архив
        composeTestRule.onNodeWithTag("nav-archive").performClick()

        // Проверяем, что карточка сохранилась
        composeTestRule.onNodeWithTag("archive-card-demo-1").assertIsDisplayed()
    }
}
