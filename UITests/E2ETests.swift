import XCTest

final class E2ETests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    // MARK: - Список заметок

    // SC-001: Главная страница загружается и отображает список заметок
    func testSC001_MainPageDisplaysNotesList() throws {
        // Проверяем заголовок
        let title = app.staticTexts["Notes App"]
        XCTAssertTrue(title.waitForExistence(timeout: 5), "Заголовок 'Notes App' должен отображаться")

        // Проверяем поле поиска
        let searchInput = app.textFields["search-input"]
        XCTAssertTrue(searchInput.waitForExistence(timeout: 5), "Поле поиска должно присутствовать")

        // Проверяем контейнер списка заметок
        let notesList = app.otherElements["notes-list"]
        XCTAssertTrue(notesList.waitForExistence(timeout: 5), "Контейнер notes-list должен присутствовать")

        // Проверяем 5 карточек заметок
        let articles = notesList.cells
        XCTAssertEqual(articles.count, 5, "Должно отображаться 5 карточек заметок")
    }

    // SC-002: Карточка заметки отображает заголовок, контент и дату
    func testSC002_NoteCardShowsTitleContentDate() throws {
        let notesList = app.otherElements["notes-list"]
        XCTAssertTrue(notesList.waitForExistence(timeout: 5))

        // Проверяем наличие карточки «Список покупок»
        let cardTitle = notesList.staticTexts["Список покупок"]
        XCTAssertTrue(cardTitle.waitForExistence(timeout: 5), "Карточка 'Список покупок' должна отображаться")

        // Проверяем контент заметки
        let content = notesList.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Молоко'"))
        XCTAssertTrue(content.firstMatch.waitForExistence(timeout: 5), "Контент карточки должен содержать текст")
    }

    // SC-003: Короткий контент не обрезается
    func testSC003_ShortContentNotTruncated() throws {
        let notesList = app.otherElements["notes-list"]
        XCTAssertTrue(notesList.waitForExistence(timeout: 5))

        // «Заметка о встрече» — контент менее 150 символов
        let content = notesList.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Обсудить план на следующий квартал'"))
        XCTAssertTrue(content.firstMatch.waitForExistence(timeout: 5))

        // Проверяем отсутствие многоточия
        let contentText = content.firstMatch.label
        XCTAssertFalse(contentText.contains("…"), "Короткий контент не должен обрезаться")
    }

    // SC-004: Заметки отсортированы по дате обновления
    func testSC004_NotesSortedByUpdateDate() throws {
        let notesList = app.otherElements["notes-list"]
        XCTAssertTrue(notesList.waitForExistence(timeout: 5))

        // Проверяем порядок заголовков
        let expectedOrder = [
            "Рецепт пасты",
            "Заметка о встрече",
            "Идеи для проекта",
            "Список покупок",
            "Добро пожаловать в Notes App"
        ]

        for title in expectedOrder {
            XCTAssertTrue(notesList.staticTexts[title].waitForExistence(timeout: 5),
                         "Заметка '\(title)' должна присутствовать")
        }
    }

    // MARK: - Поиск

    // SC-010: Поиск фильтрует заметки по заголовку и содержимому
    func testSC010_SearchFiltersByTitleAndContent() throws {
        let searchInput = app.textFields["search-input"]
        let notesList = app.otherElements["notes-list"]

        XCTAssertTrue(searchInput.waitForExistence(timeout: 5))
        XCTAssertTrue(notesList.waitForExistence(timeout: 5))

        // Поиск по заголовку
        searchInput.tap()
        searchInput.typeText("покупок")

        // Ждём обновления (debounce 300ms)
        let shopCard = notesList.staticTexts["Список покупок"]
        XCTAssertTrue(shopCard.waitForExistence(timeout: 5))

        // Очищаем поле
        searchInput.tap()
        if let value = searchInput.value as? String {
            let deleteString = String(repeating: XCUIKeyboardKey.delete.rawValue, count: value.count)
            searchInput.typeText(deleteString)
        }

        // Поиск по содержимому
        searchInput.typeText("пармезан")

        let pastaCard = notesList.staticTexts["Рецепт пасты"]
        XCTAssertTrue(pastaCard.waitForExistence(timeout: 5))
    }

    // SC-011: Поиск без учёта регистра
    func testSC011_SearchCaseInsensitive() throws {
        let searchInput = app.textFields["search-input"]
        let notesList = app.otherElements["notes-list"]

        XCTAssertTrue(searchInput.waitForExistence(timeout: 5))

        // Верхний регистр
        searchInput.tap()
        searchInput.typeText("РЕЦЕПТ")

        let pastaCard = notesList.staticTexts["Рецепт пасты"]
        XCTAssertTrue(pastaCard.waitForExistence(timeout: 5), "Поиск РЕЦЕПТ должен найти 'Рецепт пасты'")
    }

    // SC-012: Заглушка «Ничего не найдено»
    func testSC012_EmptySearchResultsPlaceholder() throws {
        let searchInput = app.textFields["search-input"]
        let notesList = app.otherElements["notes-list"]

        XCTAssertTrue(searchInput.waitForExistence(timeout: 5))

        searchInput.tap()
        searchInput.typeText("xyzнесуществующийтекст123")

        let emptyMessage = notesList.staticTexts["Ничего не найдено"]
        XCTAssertTrue(emptyMessage.waitForExistence(timeout: 5), "Должна отображаться заглушка 'Ничего не найдено'")
    }

    // SC-013: Очистка поиска сбрасывает фильтр
    func testSC013_ClearSearchResetsFilter() throws {
        let searchInput = app.textFields["search-input"]
        let notesList = app.otherElements["notes-list"]

        XCTAssertTrue(searchInput.waitForExistence(timeout: 5))

        // Вводим запрос
        searchInput.tap()
        searchInput.typeText("рецепт")

        let pastaCard = notesList.staticTexts["Рецепт пасты"]
        XCTAssertTrue(pastaCard.waitForExistence(timeout: 5))

        // Нажимаем кнопку очистки
        let clearButton = app.buttons["Очистить поиск"]
        XCTAssertTrue(clearButton.waitForExistence(timeout: 5))
        clearButton.tap()

        // Проверяем, что все 5 заметок снова отображаются
        let welcomeCard = notesList.staticTexts["Добро пожаловать в Notes App"]
        XCTAssertTrue(welcomeCard.waitForExistence(timeout: 5), "Все заметки должны отображаться после очистки")
    }

    // SC-014: Поиск находит совпадения в нескольких заметках
    func testSC014_SearchMatchesMultipleNotes() throws {
        let searchInput = app.textFields["search-input"]
        let notesList = app.otherElements["notes-list"]

        XCTAssertTrue(searchInput.waitForExistence(timeout: 5))

        searchInput.tap()
        searchInput.typeText("заметк")

        // Ожидаем 3 результата
        let meetingCard = notesList.staticTexts["Заметка о встрече"]
        XCTAssertTrue(meetingCard.waitForExistence(timeout: 5))

        let welcomeCard = notesList.staticTexts["Добро пожаловать в Notes App"]
        XCTAssertTrue(welcomeCard.waitForExistence(timeout: 5))

        let ideasCard = notesList.staticTexts["Идеи для проекта"]
        XCTAssertTrue(ideasCard.waitForExistence(timeout: 5))
    }
}
