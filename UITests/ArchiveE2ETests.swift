import XCTest

/// E2E-тесты для функциональности архива записей
final class ArchiveE2ETests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    // MARK: - Навигация

    /// SC-001: Отображение навигационной панели с ссылками «Главная» и «Архив»
    func testSC001_NavigationBarDisplayed() throws {
        let navHome = app.buttons["nav-home"]
        XCTAssertTrue(navHome.waitForExistence(timeout: 5), "Кнопка «Главная» должна отображаться")

        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5), "Кнопка «Архив» должна отображаться")
    }

    /// SC-002: Навигация между главной и архивом
    func testSC002_NavigationBetweenPages() throws {
        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5))
        navArchive.tap()

        let archiveTitle = app.staticTexts["archive-title"]
        XCTAssertTrue(archiveTitle.waitForExistence(timeout: 5), "Заголовок «Архив» должен отображаться")

        let navHome = app.buttons["nav-home"]
        XCTAssertTrue(navHome.waitForExistence(timeout: 5))
        navHome.tap()

        let homeTitle = app.staticTexts["home-title"]
        XCTAssertTrue(homeTitle.waitForExistence(timeout: 5), "Заголовок «Notes App» должен отображаться")
    }

    /// SC-003: Главная страница содержит заголовок, ссылку на архив и демо-секцию
    func testSC003_HomePageStructure() throws {
        let homeTitle = app.staticTexts["home-title"]
        XCTAssertTrue(homeTitle.waitForExistence(timeout: 5))

        let archiveLink = app.buttons["home-archive-link"]
        XCTAssertTrue(archiveLink.waitForExistence(timeout: 5), "Ссылка «Перейти в Архив» должна отображаться")

        let demoSection = app.otherElements["demo-section"]
        XCTAssertTrue(demoSection.waitForExistence(timeout: 5), "Демо-секция должна отображаться")

        let archiveButton = app.buttons["archive-button-demo-1"]
        XCTAssertTrue(archiveButton.waitForExistence(timeout: 5), "Кнопка архивации демо-записи должна отображаться")
    }

    /// SC-004: Ссылка «Перейти в Архив» ведёт на страницу архива
    func testSC004_HomeArchiveLinkNavigation() throws {
        let archiveLink = app.buttons["home-archive-link"]
        XCTAssertTrue(archiveLink.waitForExistence(timeout: 5))
        archiveLink.tap()

        let archiveTitle = app.staticTexts["archive-title"]
        XCTAssertTrue(archiveTitle.waitForExistence(timeout: 5), "Должна открыться страница архива")
    }

    // MARK: - UI архива

    /// SC-201: Страница архива — пустое состояние
    func testSC201_ArchiveEmptyState() throws {
        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5))
        navArchive.tap()

        let archiveTitle = app.staticTexts["archive-title"]
        XCTAssertTrue(archiveTitle.waitForExistence(timeout: 5))

        let emptyArchive = app.otherElements["empty-archive"]
        XCTAssertTrue(emptyArchive.waitForExistence(timeout: 5), "Пустое состояние архива должно отображаться")
    }

    /// SC-202: Архивация записи через демо-кнопку
    func testSC202_ArchiveNoteViaDemoButton() throws {
        let archiveButton = app.buttons["archive-button-demo-1"]
        XCTAssertTrue(archiveButton.waitForExistence(timeout: 5))

        archiveButton.tap()

        // Переход на страницу архива
        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5))
        navArchive.tap()

        let archiveCard = app.otherElements["archive-card-demo-1"]
        XCTAssertTrue(archiveCard.waitForExistence(timeout: 5), "Карточка архивной записи должна появиться")
    }

    /// SC-203: Восстановление записи из архива
    func testSC203_RestoreNoteFromArchive() throws {
        // Сначала архивируем запись
        let archiveButton = app.buttons["archive-button-demo-1"]
        XCTAssertTrue(archiveButton.waitForExistence(timeout: 5))
        archiveButton.tap()

        // Переходим в архив
        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5))
        navArchive.tap()

        let archiveCard = app.otherElements["archive-card-demo-1"]
        XCTAssertTrue(archiveCard.waitForExistence(timeout: 5))

        // Нажимаем кнопку восстановления
        let restoreButton = app.buttons["restore-note-demo-1"]
        XCTAssertTrue(restoreButton.waitForExistence(timeout: 5))
        restoreButton.tap()

        // Проверяем пустое состояние
        let emptyArchive = app.otherElements["empty-archive"]
        XCTAssertTrue(emptyArchive.waitForExistence(timeout: 5), "Архив должен стать пустым после восстановления")
    }

    /// SC-204: Карточка архивной записи — отображение данных
    func testSC204_ArchiveCardDisplaysData() throws {
        // Архивируем демо-запись
        let archiveButton = app.buttons["archive-button-demo-1"]
        XCTAssertTrue(archiveButton.waitForExistence(timeout: 5))
        archiveButton.tap()

        // Переходим в архив
        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5))
        navArchive.tap()

        let archiveCard = app.otherElements["archive-card-demo-1"]
        XCTAssertTrue(archiveCard.waitForExistence(timeout: 5))

        // Проверяем содержимое карточки
        XCTAssertTrue(archiveCard.staticTexts["Демо запись"].exists, "Заголовок записи должен отображаться")
        XCTAssertTrue(archiveCard.staticTexts["Содержимое демо записи"].exists, "Содержимое записи должно отображаться")

        let restoreButton = app.buttons["restore-note-demo-1"]
        XCTAssertTrue(restoreButton.waitForExistence(timeout: 5), "Кнопка восстановления должна отображаться")
    }

    /// SC-205: Данные сохраняются после перезапуска приложения
    func testSC205_PersistenceAfterRelaunch() throws {
        // Архивируем запись
        let archiveButton = app.buttons["archive-button-demo-1"]
        XCTAssertTrue(archiveButton.waitForExistence(timeout: 5))
        archiveButton.tap()

        // Перезапускаем приложение
        app.terminate()
        app.launch()

        // Переходим в архив
        let navArchive = app.buttons["nav-archive"]
        XCTAssertTrue(navArchive.waitForExistence(timeout: 5))
        navArchive.tap()

        // Проверяем, что карточка всё ещё отображается
        let archiveCard = app.otherElements["archive-card-demo-1"]
        XCTAssertTrue(archiveCard.waitForExistence(timeout: 5), "Архивная запись должна сохраниться после перезапуска")
    }
}
