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
    And The archived footer link reads Show archived (1)
    When User clicks the archived footer link
    Then The idea browser lists the ideas Open idea, Shelved idea
    And The idea Shelved idea is labelled Archived
    And The archived footer link reads Hide archived (1)

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
