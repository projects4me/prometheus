@setupApplicationTest
Feature: Issue | ezSearch on the issue list

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And The issue statuses are available
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    ---------
    | issue |
    | 10    |
    ---------

  Scenario: Typing a query and pressing Enter searches the list

    When User navigates to app/project/project_1/issue
    And User types "prio = hi status != done" in the issue search bar and presses Enter
    Then the issue search bar shows "((Issue.priority : high) AND (Issue.status !: done))"
    And the issue list was queried with "((Issue.priority : high) AND (Issue.status !: done))" and the project
    And the url has a query

  Scenario: Accepting a suggestion with Down and Tab

    When User navigates to app/project/project_1/issue
    And User types "prio" in the issue search bar
    And User presses Down and Tab in the issue search bar
    And User types "= hi" at the end of the issue search bar and presses Enter
    Then the issue list was queried with "((Issue.priority : high))" and the project

  Scenario: Adding a condition in the builder updates the bar

    When User navigates to app/project/project_1/issue
    And User opens the issue search builder
    And User adds a Status condition in the issue search builder
    Then the issue search bar contains "Issue.status"

  Scenario: Picking a saved search

    Given There is a saved search related to issue
    When User navigates to app/project/project_1/issue
    And User selects a saved search in the issue ezSearch
    Then the issue search bar shows "((Issue.subject CONTAINS savedsearch))"
    And the issue list was queried with "savedsearch" in it
    And the url has a saved search id

  Scenario: An invalid query shows the error and sends nothing

    When User navigates to app/project/project_1/issue
    And User tries "status:zzz" in the issue search bar
    Then the issue search shows an error
    And the issue search button is disabled
    And no new issue request was made
