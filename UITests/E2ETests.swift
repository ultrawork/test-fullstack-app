import XCTest

/// E2E тесты для Notes App (iOS WebView/Native обёртка)
/// Тесты используют accessibilityIdentifier для поиска элементов
final class E2ETests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    // MARK: - Аутентификация

    // SC-001: Регистрация нового пользователя
    func testSC001_RegisterNewUser() throws {
        let emailField = app.textFields["register_email"]
        XCTAssertTrue(emailField.waitForExistence(timeout: 5))
        emailField.tap()
        emailField.typeText("ios-test-\(Int(Date().timeIntervalSince1970))@example.com")

        let passwordField = app.secureTextFields["register_password"]
        XCTAssertTrue(passwordField.waitForExistence(timeout: 5))
        passwordField.tap()
        passwordField.typeText("TestPass123")

        let confirmField = app.secureTextFields["register_confirm_password"]
        XCTAssertTrue(confirmField.waitForExistence(timeout: 5))
        confirmField.tap()
        confirmField.typeText("TestPass123")

        let createButton = app.buttons["register_submit"]
        XCTAssertTrue(createButton.waitForExistence(timeout: 5))
        createButton.tap()

        // Ожидаем дашборд
        let dashboardTitle = app.staticTexts["dashboard_title"]
        XCTAssertTrue(dashboardTitle.waitForExistence(timeout: 10))
    }

    // SC-004: Вход в систему
    func testSC004_LoginWithValidCredentials() throws {
        let emailField = app.textFields["login_email"]
        XCTAssertTrue(emailField.waitForExistence(timeout: 5))
        emailField.tap()
        emailField.typeText("test-login@example.com")

        let passwordField = app.secureTextFields["login_password"]
        XCTAssertTrue(passwordField.waitForExistence(timeout: 5))
        passwordField.tap()
        passwordField.typeText("TestPass123")

        let signInButton = app.buttons["login_submit"]
        XCTAssertTrue(signInButton.waitForExistence(timeout: 5))
        signInButton.tap()

        let dashboardTitle = app.staticTexts["dashboard_title"]
        XCTAssertTrue(dashboardTitle.waitForExistence(timeout: 10))
    }

    // SC-006: Выход из системы
    func testSC006_Logout() throws {
        // Предполагаем что пользователь авторизован
        let signOutButton = app.buttons["sign_out_button"]
        XCTAssertTrue(signOutButton.waitForExistence(timeout: 5))
        signOutButton.tap()

        let loginScreen = app.textFields["login_email"]
        XCTAssertTrue(loginScreen.waitForExistence(timeout: 10))
    }

    // MARK: - Заметки

    // SC-101: Создание заметки
    func testSC101_CreateNote() throws {
        let newNoteButton = app.buttons["new_note_button"]
        XCTAssertTrue(newNoteButton.waitForExistence(timeout: 5))
        newNoteButton.tap()

        let titleField = app.textFields["note_title"]
        XCTAssertTrue(titleField.waitForExistence(timeout: 5))
        titleField.tap()
        titleField.typeText("Тестовая заметка iOS")

        let contentField = app.textViews["note_content"]
        XCTAssertTrue(contentField.waitForExistence(timeout: 5))
        contentField.tap()
        contentField.typeText("Содержимое тестовой заметки")

        let createButton = app.buttons["note_submit"]
        XCTAssertTrue(createButton.waitForExistence(timeout: 5))
        createButton.tap()

        let noteCard = app.staticTexts["Тестовая заметка iOS"]
        XCTAssertTrue(noteCard.waitForExistence(timeout: 10))
    }

    // SC-105: Удаление заметки
    func testSC105_DeleteNote() throws {
        let deleteButton = app.buttons["note_delete_button"]
        XCTAssertTrue(deleteButton.waitForExistence(timeout: 5))
        deleteButton.tap()

        let confirmDelete = app.buttons["delete_confirm_button"]
        XCTAssertTrue(confirmDelete.waitForExistence(timeout: 5))
        confirmDelete.tap()

        // Заметка должна исчезнуть
        let emptyState = app.staticTexts["empty_state_title"]
        XCTAssertTrue(emptyState.waitForExistence(timeout: 10))
    }

    // SC-107: Поиск заметок
    func testSC107_SearchNotes() throws {
        let searchField = app.searchFields["search_input"]
        XCTAssertTrue(searchField.waitForExistence(timeout: 5))
        searchField.tap()
        searchField.typeText("борщ")

        // Ожидаем обновления списка
        let noteCard = app.staticTexts["Рецепт борща"]
        XCTAssertTrue(noteCard.waitForExistence(timeout: 10))
    }

    // MARK: - Категории

    // SC-201: Создание категории
    func testSC201_CreateCategory() throws {
        let manageCategoriesLink = app.buttons["manage_categories_link"]
        XCTAssertTrue(manageCategoriesLink.waitForExistence(timeout: 5))
        manageCategoriesLink.tap()

        let nameField = app.textFields["category_name"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 5))
        nameField.tap()
        nameField.typeText("Работа")

        let addButton = app.buttons["category_submit"]
        XCTAssertTrue(addButton.waitForExistence(timeout: 5))
        addButton.tap()

        let categoryLabel = app.staticTexts["Работа"]
        XCTAssertTrue(categoryLabel.waitForExistence(timeout: 10))
    }

    // SC-301: Лендинг — навигация
    func testSC301_LandingNavigation() throws {
        let title = app.staticTexts["Notes App"]
        XCTAssertTrue(title.waitForExistence(timeout: 5))

        let signInLink = app.buttons["sign_in_link"]
        XCTAssertTrue(signInLink.waitForExistence(timeout: 5))

        let createAccountLink = app.buttons["create_account_link"]
        XCTAssertTrue(createAccountLink.waitForExistence(timeout: 5))

        signInLink.tap()
        let loginField = app.textFields["login_email"]
        XCTAssertTrue(loginField.waitForExistence(timeout: 5))
    }
}
