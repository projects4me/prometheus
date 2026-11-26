@setupApplicationTest
Feature: Gantt | every milestone starts expanded

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 3                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    And Each milestone has 2 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 0         | 0    |  0       | 0       | 0        |
    ------------------------------------------------------------------------

  Scenario: Opening the gantt shows the issues of every milestone

    When User navigates to app/project/project_1/gantt
    Then The gantt shows 3 milestone rows
    And The gantt shows 9 issue rows

  Scenario: A collapsed milestone stays collapsed when the search reloads the gantt

    When User navigates to app/project/project_1/gantt
    And User collapses the first gantt milestone
    Then The gantt has 1 collapsed milestone
    When User types "subject ~ task" in the gantt search bar and presses Enter
    Then The gantt has 1 collapsed milestone
