@setupApplicationTest
Feature: render milestone

  Scenario: Render a milestone in taskboard and check number of issues based on status

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
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
    When User navigates to app/project/project_1/board
    Then User should see 1 issues in new status
    And User should see 1 issues in in_progress status
    And User should see 2 issues in done status
    And User should see 0 issues in feedback status
    And User should see 0 issues in pending status
    And User should see 0 issues in deferred status

  Scenario: Render a milestone in taskboard and check spent and estimated time

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
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
    And Each issue has 5 hours and 45 minutes of spent time
    And Each issue has 3 hours and 15 minutes of estimated time
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board
    Then User should see 28 hours and 45 minutes of spent time of first milestone
    And User should see 16 hours and 15 minutes of estimated time of first milestone

  Scenario: Render a milestone in taskboard and check issue details

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------
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
    When User navigates to app/project/project_1/board
    And User clicks on first issue quick view
    Then User should see issue details section with issue subject