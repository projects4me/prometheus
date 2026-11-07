@setupApplicationTest
Feature: Gantt | search the task list with ezSearch

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
    And Each milestone has 2 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 0         | 0    |  0       | 0       | 0        |
    ------------------------------------------------------------------------

  Scenario: Running a query requests the issues with it ANDed with milestone and project

    When User navigates to app/project/project_1/gantt
    And User types "subject ~ task" in the gantt search bar and presses Enter
    Then The gantt issues were requested with "Issue.subject" and the milestone and project
    And The gantt url keeps the search

  Scenario: Removing a chip runs the search again

    When User navigates to app/project/project_1/gantt
    And User types "subject ~ task" in the gantt search bar and presses Enter
    And User removes the first applied filter of the gantt search
    Then The last gantt issue request has no search

  Scenario: Applying a saved search shows its name

    Given The gantt saved search Mine is (Issue.subject CONTAINS task)
    When User navigates to app/project/project_1/gantt
    And User selects the gantt saved search
    Then The gantt saved search button shows Mine

  Scenario: Saving the applied query adds a saved search of the project

    When User navigates to app/project/project_1/gantt
    And User types "subject ~ task" in the gantt search bar and presses Enter
    And User saves the gantt search as Tasks
    Then A gantt saved search Tasks of the issues was stored with "Issue.subject"
    And The gantt saved search list has Tasks

  Scenario: An invalid query shows an error and sends nothing

    When User navigates to app/project/project_1/gantt
    And User tries "status:zzz" in the gantt search bar
    Then The gantt search shows an error
    And No new gantt issue request was made
