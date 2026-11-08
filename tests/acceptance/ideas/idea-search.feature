@setupApplicationTest
Feature: Ideas | search the idea browser

  Background:
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

  Scenario: Running a query requests the list with it and shows the count

    When User opens the ideas of the project
    Then The idea browser count reads 2
    When User types "title ~ idea status = open" in the idea search bar and presses Enter
    Then The idea list was requested with "Idea.title"
    And The idea browser count reads 2
    And The idea url keeps the search

  Scenario: Removing a chip runs the search again

    When User opens the ideas of the project
    And User types "title ~ idea" in the idea search bar and presses Enter
    And User removes the first applied filter of the idea search
    Then The idea list was requested with no search
    And The idea browser count reads 2

  Scenario: Applying a saved search shows its name, editing it shows edited and updating clears it

    Given The idea saved search Mine is (Idea.title CONTAINS idea)
    When User opens the ideas of the project
    And User selects the idea saved search
    Then The idea saved search button shows Mine
    And The idea list was requested with "Idea.title CONTAINS idea"
    When User types "status = open" in the idea search bar and presses Enter
    Then The idea saved search button shows edited
    When User updates the active idea saved search
    Then The idea saved search button does not show edited

  Scenario: A search lists open ideas only and keeps the archived footer

    When User opens the ideas of the project
    And User types "title ~ idea" in the idea search bar and presses Enter
    Then The idea list was requested for the open ideas only
    And The idea browser lists the ideas Newest idea, Older idea
    And The archived footer link reads Show archived (1)

  Scenario: With show archived the search finds archived ideas in the server order

    When User opens the ideas of the project
    And User types "title ~ idea" in the idea search bar and presses Enter
    And User clicks the archived footer link
    Then The idea list was requested for every status
    And The idea browser lists the ideas Shelved idea, Newest idea, Older idea

  Scenario: Opening another idea keeps the search

    When User opens the ideas of the project
    And User types "title ~ idea" in the idea search bar and presses Enter
    And User selects the idea Older idea in the browser
    Then The idea url keeps the search

  Scenario: An invalid query shows an error and sends nothing

    When User opens the ideas of the project
    And User tries "status:zzz" in the idea search bar
    Then The idea search shows an error
    And No new idea request was made
