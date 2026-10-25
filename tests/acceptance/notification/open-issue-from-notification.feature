@setupApplicationTest
Feature: Notification | open the issue of a notification

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 1                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    And Each milestone has 5 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues

  Scenario: a comment notification of an issue on the board opens the board's quick view

    Given User has an unread comment notification for the first issue on the board
    When User navigates to app/project/project_1/board
    And User clicks on notifications icon
    And User clicks on the issue notification
    Then The board's quick view shows the issue of the notification
    And The URL is still the task board
    And The issue notification is marked as read

  Scenario: the group heading of an issue on the board opens the board's quick view

    Given User has an unread comment notification for the first issue on the board
    When User navigates to app/project/project_1/board
    And User clicks on notifications icon
    And User clicks on the notification group heading
    Then The board's quick view shows the issue of the notification
    And The URL is still the task board
    And The issue notification is marked as read

  Scenario: a notification of an issue that is not on the board opens the issue page

    Given User has an unread comment notification for an issue that is not on the board
    When User navigates to app/project/project_1/board
    And User clicks on notifications icon
    And User clicks on the issue notification with navigation enabled
    Then The issue page of the notification is opened at its comment
    And User should not see the panel divider handle
    And The issue notification is marked as read

  Scenario: after leaving the board a notification opens the issue page

    Given User has an unread comment notification for the first issue on the board
    When User navigates to app/project/project_1/board
    And User navigates to app
    And User clicks on notifications icon
    And User clicks on the issue notification with navigation enabled
    Then The issue page of the notification is opened at its comment
