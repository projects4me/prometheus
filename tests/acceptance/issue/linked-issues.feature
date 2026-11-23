@setupApplicationTest
Feature: Linked issues | The relations of an issue on its detail page

  Scenario: An issue without links shows the empty state
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    When User navigates to app/project/PROJECT_1/issue/1
    Then The linked issues box should show no linked issues

  Scenario: Blocked by and blocks groups are shown around the current issue
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    And User creates linked issue with subject "Blocker" and issue number 2
    And User creates linked issue with subject "Blocked" and issue number 3
    And Issue 2 blocks issue 1
    And Issue 1 blocks issue 3
    When User navigates to app/project/PROJECT_1/issue/1
    Then The linked issues should list groups blockedBy, current, blocks in that order
    And The linked issues box should display issue 2
    And The linked issues box should display issue 3

  Scenario: User navigates to a linked issue from the box
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And There is custom callback for issue
    And User creates linked issue with subject "Blocker" and issue number 2
    And Issue 2 blocks issue 1
    When User navigates to app/project/PROJECT_1/issue/1
    And User opens issue 2 from the linked issues box
    Then The linked issue route should be /app/project/project_1/issue/2
