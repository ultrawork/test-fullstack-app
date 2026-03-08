import XCTest

/// E2E тесты для системы тегов iOS (SwiftUI)
final class E2ETests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    // MARK: - SC-020: Создание нового тега

    func testSC020_createNewTag() throws {
        // Открываем менеджер тегов
        let createButton = app.buttons["tag_manager_create_button"]
        XCTAssertTrue(createButton.waitForExistence(timeout: 5))
        createButton.tap()

        // Заполняем форму
        let nameField = app.textFields["tag_form_name_field"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 5))
        nameField.tap()
        nameField.typeText("Работа")

        // Выбираем цвет
        let colorButton = app.buttons["tag_form_color_#3B82F6"]
        if colorButton.waitForExistence(timeout: 3) {
            colorButton.tap()
        }

        // Нажимаем Create
        let submitButton = app.buttons["tag_form_submit_button"]
        XCTAssertTrue(submitButton.waitForExistence(timeout: 5))
        submitButton.tap()

        // Проверяем что тег появился в списке
        let tagRow = app.staticTexts["Работа"]
        XCTAssertTrue(tagRow.waitForExistence(timeout: 5))
    }

    // MARK: - SC-021: Создание тега с невалидными данными

    func testSC021_createTagWithEmptyName() throws {
        let createButton = app.buttons["tag_manager_create_button"]
        XCTAssertTrue(createButton.waitForExistence(timeout: 5))
        createButton.tap()

        // Пытаемся создать без имени
        let submitButton = app.buttons["tag_form_submit_button"]
        XCTAssertTrue(submitButton.waitForExistence(timeout: 5))

        // Кнопка должна быть задизейблена при пустом имени
        XCTAssertFalse(submitButton.isEnabled)
    }

    // MARK: - SC-022: Редактирование тега

    func testSC022_editTag() throws {
        // Сначала создаём тег
        let createButton = app.buttons["tag_manager_create_button"]
        XCTAssertTrue(createButton.waitForExistence(timeout: 5))
        createButton.tap()

        let nameField = app.textFields["tag_form_name_field"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 5))
        nameField.tap()
        nameField.typeText("Работа")

        let submitButton = app.buttons["tag_form_submit_button"]
        submitButton.tap()

        // Ждём возврата к списку
        let tagText = app.staticTexts["Работа"]
        XCTAssertTrue(tagText.waitForExistence(timeout: 5))

        // Свайп влево для редактирования
        let editButton = app.buttons["tag_manager_edit_Работа"]
        if editButton.waitForExistence(timeout: 3) {
            editButton.tap()
        }

        // Изменяем имя
        let editNameField = app.textFields["tag_form_name_field"]
        XCTAssertTrue(editNameField.waitForExistence(timeout: 5))
        editNameField.tap()
        // Очищаем поле
        if let value = editNameField.value as? String, !value.isEmpty {
            editNameField.tap()
            let selectAll = XCUIApplication().menuItems["Select All"]
            if selectAll.waitForExistence(timeout: 2) {
                selectAll.tap()
            }
        }
        editNameField.typeText("Личное")

        // Сохраняем
        let updateButton = app.buttons["tag_form_submit_button"]
        XCTAssertTrue(updateButton.waitForExistence(timeout: 5))
        updateButton.tap()

        // Проверяем обновлённый тег
        let updatedTag = app.staticTexts["Личное"]
        XCTAssertTrue(updatedTag.waitForExistence(timeout: 5))
    }

    // MARK: - SC-023: Удаление тега

    func testSC023_deleteTag() throws {
        // Создаём тег
        let createButton = app.buttons["tag_manager_create_button"]
        XCTAssertTrue(createButton.waitForExistence(timeout: 5))
        createButton.tap()

        let nameField = app.textFields["tag_form_name_field"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 5))
        nameField.tap()
        nameField.typeText("Личное")

        let submitButton = app.buttons["tag_form_submit_button"]
        submitButton.tap()

        let tagText = app.staticTexts["Личное"]
        XCTAssertTrue(tagText.waitForExistence(timeout: 5))

        // Удаляем тег
        let deleteButton = app.buttons["tag_manager_delete_Личное"]
        if deleteButton.waitForExistence(timeout: 3) {
            deleteButton.tap()
        }

        // Подтверждаем удаление
        let confirmDelete = app.alerts.buttons["tag_manager_confirm_delete"]
        if confirmDelete.waitForExistence(timeout: 3) {
            confirmDelete.tap()
        }

        // Проверяем что тег удалён
        XCTAssertFalse(tagText.waitForExistence(timeout: 3))
    }

    // MARK: - SC-025: Отображение списка тегов

    func testSC025_tagManagerShowsTags() throws {
        // Проверяем что менеджер тегов загружается
        let loadingIndicator = app.activityIndicators["tag_manager_loading"]
        // Если есть загрузка — ждём завершения
        if loadingIndicator.exists {
            let disappeared = NSPredicate(format: "exists == false")
            expectation(for: disappeared, evaluatedWith: loadingIndicator)
            waitForExpectations(timeout: 10)
        }

        // Если нет тегов — должно быть пустое состояние
        let emptyState = app.staticTexts["tag_manager_empty_title"]
        let tagList = app.tables.firstMatch
        XCTAssertTrue(emptyState.waitForExistence(timeout: 5) || tagList.waitForExistence(timeout: 5))
    }
}
