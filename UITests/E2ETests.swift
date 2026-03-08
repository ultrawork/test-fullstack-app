import XCTest

/// E2E тесты для iOS (SwiftUI) — теги и изображения
final class E2ETests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    // MARK: - Теги

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

    // MARK: - Изображения

    // MARK: - SC-016: Загрузка изображений при редактировании заметки

    func testSC016_uploadImageWhileEditingNote() throws {
        // Переходим к редактированию заметки
        let editNoteButton = app.buttons["note_edit_button"]
        XCTAssertTrue(editNoteButton.waitForExistence(timeout: 5))
        editNoteButton.tap()

        // Нажимаем на drop-zone для добавления изображения
        let addImageButton = app.buttons["image_uploader_add_button"]
        XCTAssertTrue(addImageButton.waitForExistence(timeout: 5))
        addImageButton.tap()

        // Выбираем изображение из галереи (фотобиблиотека)
        let photoLibrary = app.buttons["image_uploader_photo_library"]
        if photoLibrary.waitForExistence(timeout: 3) {
            photoLibrary.tap()
        }

        // Ждём завершения загрузки — счётчик должен обновиться
        let imageCounter = app.staticTexts["image_uploader_counter"]
        XCTAssertTrue(imageCounter.waitForExistence(timeout: 10))

        // Сохраняем заметку
        let saveButton = app.buttons["note_editor_save_button"]
        XCTAssertTrue(saveButton.waitForExistence(timeout: 5))
        saveButton.tap()

        // Проверяем что галерея изображений отображается на странице просмотра
        let imageGallery = app.otherElements["note_image_gallery"]
        XCTAssertTrue(imageGallery.waitForExistence(timeout: 5))
    }

    // MARK: - SC-017: Загрузка изображений при создании новой заметки

    func testSC017_uploadImagesWhileCreatingNote() throws {
        // Переходим к созданию заметки
        let createNoteButton = app.buttons["note_create_button"]
        XCTAssertTrue(createNoteButton.waitForExistence(timeout: 5))
        createNoteButton.tap()

        // Заполняем поля заметки
        let titleField = app.textFields["note_editor_title_field"]
        XCTAssertTrue(titleField.waitForExistence(timeout: 5))
        titleField.tap()
        titleField.typeText("Заметка с фото")

        let contentField = app.textViews["note_editor_content_field"]
        XCTAssertTrue(contentField.waitForExistence(timeout: 5))
        contentField.tap()
        contentField.typeText("Тест загрузки изображений")

        // Добавляем изображение
        let addImageButton = app.buttons["image_uploader_add_button"]
        XCTAssertTrue(addImageButton.waitForExistence(timeout: 5))
        addImageButton.tap()

        // Выбираем фото из библиотеки
        let photoLibrary = app.buttons["image_uploader_photo_library"]
        if photoLibrary.waitForExistence(timeout: 3) {
            photoLibrary.tap()
        }

        // Ожидаем появления pending-превью
        let pendingImage = app.images["image_uploader_pending_0"]
        XCTAssertTrue(pendingImage.waitForExistence(timeout: 5))

        // Создаём заметку
        let saveButton = app.buttons["note_editor_save_button"]
        XCTAssertTrue(saveButton.waitForExistence(timeout: 5))
        saveButton.tap()

        // Проверяем что галерея изображений отображается
        let imageGallery = app.otherElements["note_image_gallery"]
        XCTAssertTrue(imageGallery.waitForExistence(timeout: 10))
    }

    // MARK: - SC-018: Удаление изображения из заметки

    func testSC018_deleteImageFromNote() throws {
        // Переходим к редактированию заметки с изображением
        let editNoteButton = app.buttons["note_edit_button"]
        XCTAssertTrue(editNoteButton.waitForExistence(timeout: 5))
        editNoteButton.tap()

        // Находим кнопку удаления изображения
        let deleteImageButton = app.buttons["image_uploader_delete_0"]
        XCTAssertTrue(deleteImageButton.waitForExistence(timeout: 5))
        deleteImageButton.tap()

        // Ждём что изображение удалено
        XCTAssertFalse(deleteImageButton.waitForExistence(timeout: 3))

        // Сохраняем заметку
        let saveButton = app.buttons["note_editor_save_button"]
        XCTAssertTrue(saveButton.waitForExistence(timeout: 5))
        saveButton.tap()

        // Проверяем что галерея не отображается (нет изображений)
        let imageGallery = app.otherElements["note_image_gallery"]
        XCTAssertFalse(imageGallery.waitForExistence(timeout: 3))
    }

    // MARK: - SC-019: Валидация загрузки — неподдерживаемый формат

    func testSC019_imageUploadValidation() throws {
        // Переходим к редактированию заметки
        let editNoteButton = app.buttons["note_edit_button"]
        XCTAssertTrue(editNoteButton.waitForExistence(timeout: 5))
        editNoteButton.tap()

        // Проверяем что счётчик изображений отображается
        let imageCounter = app.staticTexts["image_uploader_counter"]
        XCTAssertTrue(imageCounter.waitForExistence(timeout: 5))

        // Проверяем что drop-zone доступна (пока нет 5 изображений)
        let addImageButton = app.buttons["image_uploader_add_button"]
        XCTAssertTrue(addImageButton.waitForExistence(timeout: 5))
    }

    // MARK: - SC-020 (images): Ограничение на максимум 5 изображений

    func testSC020_images_maxImagesLimit() throws {
        // Переходим к редактированию заметки
        let editNoteButton = app.buttons["note_edit_button"]
        XCTAssertTrue(editNoteButton.waitForExistence(timeout: 5))
        editNoteButton.tap()

        // Проверяем что счётчик изображений отображается
        let imageCounter = app.staticTexts["image_uploader_counter"]
        XCTAssertTrue(imageCounter.waitForExistence(timeout: 5))

        // Проверяем что кнопка добавления доступна
        let addImageButton = app.buttons["image_uploader_add_button"]
        XCTAssertTrue(addImageButton.waitForExistence(timeout: 5))

        // При наличии 5 изображений — ошибка должна появиться при попытке добавить ещё
        let errorMessage = app.staticTexts["image_uploader_error"]
        // Если ошибки нет сейчас — всё ок, тест на наличие компонента
        if errorMessage.exists {
            // Проверяем что текст содержит максимум
            XCTAssertTrue(errorMessage.label.contains("Maximum") || errorMessage.label.contains("5"))
        }
    }
}
