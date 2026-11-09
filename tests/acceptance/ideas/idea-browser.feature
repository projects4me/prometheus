@setupApplicationTest
Feature: Ideas | idea browser

  Scenario: The browser lists the open ideas of the project, newest updated first

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status   | dateModified        |
    | Older idea   | open     | 2026-10-01 10:00:00 |
    | Newest idea  | open     | 2026-10-20 10:00:00 |
    | Shelved idea | archived | 2026-10-25 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    Then The sidebar shows the Idea entry
    And The idea browser lists the ideas Newest idea, Older idea
    And The idea Newest idea is labelled Brainstorming
    And The idea browser opens on the new idea form

  Scenario: The browser labels each idea with the status of its latest plan

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status | dateModified        |
    | Planned idea | open   | 2026-10-01 10:00:00 |
    | Fresh idea   | open   | 2026-10-02 10:00:00 |
    ---------------------------------------------------------
    And The plans of the idea Planned idea are
    ---------------------------
    | version | status        |
    | 2       | creating      |
    | 1       | superseded    |
    ---------------------------
    When User opens the ideas of the project
    Then The idea Planned idea is labelled Creating issues
    And The idea Fresh idea is labelled Brainstorming

  Scenario: The archived ideas are shown and hidden from the footer link

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status   | dateModified        |
    | Open idea    | open     | 2026-10-01 10:00:00 |
    | Shelved idea | archived | 2026-10-25 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    Then The idea browser lists the ideas Open idea
    And The idea list was requested for the open ideas only
    And The archived footer link reads Show archived (1)
    When User clicks the archived footer link
    Then The idea browser lists the ideas Shelved idea, Open idea
    And The idea list was requested for every status
    And The idea Shelved idea is labelled Archived
    And The archived footer link reads Hide archived (1)
    When User clicks the archived footer link
    Then The idea browser lists the ideas Open idea
    And The idea list was requested for the open ideas only

  Scenario: The archived toggle survives a reload

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status   | dateModified        |
    | Open idea    | open     | 2026-10-01 10:00:00 |
    | Shelved idea | archived | 2026-10-25 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    And User clicks the archived footer link
    And User reloads the page
    Then The idea browser lists the ideas Shelved idea, Open idea
    And The archived footer link reads Hide archived (1)

  Scenario: The idea list is sorted, paged and narrowed to the open ideas on the server

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status   | dateModified        |
    | Older idea   | open     | 2026-10-01 10:00:00 |
    | Newest idea  | open     | 2026-10-20 10:00:00 |
    | Shelved idea | archived | 2026-10-25 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    Then The idea list request sent sort as Idea.dateModified
    And The idea list request sent order as DESC
    And The idea list request sent limit as 20
    And The idea list request sent page as 1
    And The idea list request sent rels as createdBy
    And The idea list was requested for the open ideas only
    And The idea browser count reads 2

  Scenario: The page and sort query params reach the idea list request

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status   | dateModified        |
    | Older idea   | open     | 2026-10-01 10:00:00 |
    | Newest idea  | open     | 2026-10-20 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project with page=2&sort=Idea.title&order=ASC
    Then The idea list request sent page as 2
    And The idea list request sent sort as Idea.title
    And The idea list request sent order as ASC

  Scenario: The idea browser shows 20 ideas per page and the next page loads the rest

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 23 generated open ideas
    When User opens the ideas of the project
    Then The idea browser lists 20 ideas
    And The idea list request sent limit as 20
    And The idea browser pagination reads 1-20 / 20+
    And The next page button of the idea browser is enabled
    When User opens the ideas of the project with page=2
    Then The idea browser lists 3 ideas
    And The idea list request sent page as 2
    And The idea browser pagination reads 21-23 / 23
    And The next page button of the idea browser is disabled

  Scenario: Grouping by creator sorts by the creator first, then by the chosen sort

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 3 generated open ideas
    When User opens the ideas of the project with group=createdBy&sort=Idea.title&order=ASC
    Then The idea list request sent sort as Idea.createdUser,Idea.title
    And The idea list request sent order as ASC

  Scenario: Leaving the idea area resets the page, sort, order and group

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 3 generated open ideas
    When User opens the ideas of the project with page=2&sort=Idea.title&order=ASC&group=createdBy
    And User opens the board of the project
    And User clicks the Ideas entry in the sidebar
    Then The idea list request sent sort as Idea.dateModified
    And The idea list request sent order as DESC
    And The idea list request sent page as 1

  Scenario: Grouped by creator, each creator's ideas are contiguous and in the chosen order across pages

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 23 generated open ideas alternating between creators 1 and 2
    When User opens the ideas of the project with group=createdBy&sort=Idea.title&order=ASC
    Then The idea browser lists the ideas Generated idea 01, Generated idea 03, Generated idea 05, Generated idea 07, Generated idea 09, Generated idea 11, Generated idea 13, Generated idea 15, Generated idea 17, Generated idea 19, Generated idea 21, Generated idea 23, Generated idea 02, Generated idea 04, Generated idea 06, Generated idea 08, Generated idea 10, Generated idea 12, Generated idea 14, Generated idea 16
    When User opens the ideas of the project with group=createdBy&sort=Idea.title&order=ASC&page=2
    Then The idea browser lists the ideas Generated idea 18, Generated idea 20, Generated idea 22

  Scenario: Navigating between ideas highlights the selected idea

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title      | status | dateModified        |
    | First one  | open   | 2026-10-02 10:00:00 |
    | Second one | open   | 2026-10-01 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    And User selects the idea Second one in the browser
    Then The idea Second one is highlighted in the browser
    And The idea page columns are shown
    When User selects the idea First one in the browser
    Then The idea First one is highlighted in the browser

  Scenario: The New idea button is disabled while the Start an idea form is open

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title      | status | dateModified        |
    | First one  | open   | 2026-10-02 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    Then The idea browser opens on the new idea form
    And The New idea button is shown disabled
    When User selects the idea First one in the browser
    Then The New idea button is shown as a link

  Scenario: The Ideas nav item is a direct link without a submenu

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    When User opens the board of the project
    And User clicks the Ideas entry in the sidebar
    Then The ideas page is open
    And The Ideas sidebar entry has no submenu

  Scenario: The Ideas entry is hidden when the user cannot list ideas

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has idea.get permission set to 0
    And User selects Project 1
    When User opens the ideas of the project
    Then The sidebar does not show the Idea entry

  Scenario: A user who cannot create ideas sees the hint instead of the new idea form

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has idea.create permission set to 0
    And User selects Project 1
    When User opens the ideas of the project
    Then The empty idea box is shown

  Scenario: Collapsing the idea browser widens the idea page and the choice is remembered

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The collapsed state of the idea browser is cleared
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title      | status | dateModified        |
    | First idea | open   | 2026-10-01 10:00:00 |
    ---------------------------------------------------------
    When User opens the ideas of the project
    And User collapses the idea browser
    Then The idea browser is hidden and the idea page spans the full width
    And The collapsed state is remembered in the browser storage as true
    When User expands the idea browser
    Then The idea browser is shown beside the idea page
    And The collapsed state is remembered in the browser storage as false
    Then The stored idea browser state is reset

  Scenario: Paging, sorting and grouping reload only the list, not the open idea page

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 23 generated open ideas
    When User opens the ideas of the project
    And User selects the idea Generated idea 23 in the browser
    And User marks the open idea page
    And User opens the next page of the idea browser
    Then The open idea page was not redrawn
    And The idea browser lists 3 ideas
    And The idea list request sent page as 2
    When User sorts the idea browser by Idea.title
    Then The open idea page was not redrawn
    And The idea list request sent sort as Idea.title
    And The idea list request sent page as 1
    When User groups the idea browser by createdBy
    Then The open idea page was not redrawn
    And The idea list request sent sort as Idea.createdUser,Idea.title
    And The idea url has group=createdBy

  Scenario: A search and a saved search reload only the list, not the open idea page

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status   | dateModified        |
    | Older idea   | open     | 2026-10-01 10:00:00 |
    | Newest idea  | open     | 2026-10-20 10:00:00 |
    ---------------------------------------------------------
    And The idea saved search Mine is (Idea.title CONTAINS idea)
    When User opens the ideas of the project
    And User selects the idea Older idea in the browser
    And User marks the open idea page
    And User types "title ~ Newest" in the idea search bar and presses Enter
    Then The open idea page was not redrawn
    And The idea list was requested with "Idea.title"
    When User selects the idea saved search
    Then The open idea page was not redrawn
    And The idea list was requested with "Idea.title CONTAINS idea"

  Scenario: Going back restores the previous page and sort, and a reload keeps every param

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 23 generated open ideas
    When User opens the ideas of the project
    And User opens the next page of the idea browser
    And User notes the idea browser address
    And User sorts the idea browser by Idea.title
    Then The idea list request sent page as 1
    And The idea list request sent sort as Idea.title
    When User goes back to the noted idea browser address
    Then The idea list request sent page as 2
    And The idea list request sent sort as Idea.dateModified
    And The idea browser lists 3 ideas
    When User sorts the idea browser by Idea.title
    And User opens the next page of the idea browser
    And User reloads the page
    Then The idea list request sent sort as Idea.title
    And The idea list request sent order as ASC
    And The idea list request sent page as 2
    And The idea url has sort=Idea.title

  Scenario: Switching project starts the browser from its defaults with the new project's ideas

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 23 generated open ideas
    When User opens the ideas of the project with page=2&sort=Idea.title&order=ASC
    And User selects Project 2
    And The ideas of the project are
    ---------------------------------------------------------
    | title         | status | dateModified        |
    | Other project | open   | 2026-10-01 10:00:00 |
    ---------------------------------------------------------
    And User opens the ideas of the project
    Then The idea list request sent page as 1
    And The idea list request sent sort as Idea.dateModified
    And The idea browser lists the ideas Other project
    And The idea url has no page

  Scenario: A failed list load shows the list error and the retry loads it

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title       | status | dateModified        |
    | Older idea  | open   | 2026-10-01 10:00:00 |
    | Newest idea | open   | 2026-10-20 10:00:00 |
    ---------------------------------------------------------
    And The idea list fails to load
    When User opens the ideas of the project
    Then The idea browser shows the list error
    When The idea list loads again
    And User retries the idea list
    Then The idea browser lists the ideas Newest idea, Older idea
