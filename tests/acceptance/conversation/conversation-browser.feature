@setupApplicationTest
Feature: Threads | thread browser

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The threads of the project are
    -----------------------------------------------------------------------
    | subject         | roomType   | milestone | dateModified        |
    | Plain thread    | discussion |           | 2026-10-30 10:00:00 |
    | Beta thread     | discussion | Release 1 | 2026-10-10 10:00:00 |
    | Release thread  | discussion | Release 2 | 2026-10-20 10:00:00 |
    | Another beta    | discussion | Release 1 | 2026-10-05 10:00:00 |
    -----------------------------------------------------------------------

  Scenario: The first thread of the list opens by default and the list is grouped by milestone, no milestone last

    When User opens the threads of the project
    Then The thread Beta thread is open
    And The thread list groups are Release 1, Release 2, No milestone
    And The thread list rows are Beta thread, Another beta, Release thread, Plain thread

  Scenario: An old ?c_id= link opens that thread

    When User opens the threads of the project with the thread Release thread as c_id
    Then The thread Release thread is open
    And The thread url has no c_id

  Scenario: Searching reloads only the list

    When User opens the threads of the project
    And User searches the threads for "subject ~ beta"
    Then The thread list rows are Beta thread, Another beta
    And Only the thread list was requested again

  Scenario: Rows show comment counts for discussions and the vote tally for votes

    Given The thread Beta thread has 2 comments
    And The vote thread Poll has 3 agree and 1 disagree votes
    When User opens the threads of the project
    Then The thread Beta thread shows 2 comments
    And The vote thread Poll shows "3 agree · 1 disagree"

  Scenario: One count request serves the whole page
    Given The thread Beta thread has 2 comments
    And The vote thread Poll has 3 agree and 1 disagree votes
    When User opens the threads of the project
    Then The thread list made 1 count request
    And The thread Beta thread shows 2 comments
