@setupApplicationTest
Feature: create quick issue

  Scenario: Render a milestone in taskboard and create a quick issue

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
    When User navigates to app/project/project_1/board
    And User clicks on add issue button in new status
    And User enters test subject in subject
    And User enters test description in description
    And User selects option 3 of issue type
    And User selects start date of issue
    And User selects end date of issue
    And User clicks on save button
    Then There is a new issue created with test subject inside lane of new status