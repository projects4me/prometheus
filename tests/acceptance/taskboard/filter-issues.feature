@setupApplicationTest
Feature: Taskboard | search the board with EzSearchCompact

  Scenario: Typing words and pressing Enter requests every lane with the subject search

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 4 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board
    And User types "subject words" in the board search and presses Enter
    Then Every board lane was requested with "(Issue.subject CONTAINS 'subject words')"


  Scenario: Applying a saved search shows its name and sets searchId

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 4 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    And The board saved search Mine is (Issue.subject CONTAINS 'Test')
    When User navigates to app/project/project_1/board
    And User selects the board saved search
    Then The board saved search button shows Mine
    And The board url has a searchId


  Scenario: Removing the filter resets the board search

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 4 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board
    And User types "subject words" in the board search and presses Enter
    And User clears the board search
    Then The last board request has no search


  Scenario: Cards can still be dragged after a search

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 4 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board
    And User types "Issue" in the board search and presses Enter
    Then Every board lane can be sorted


  Scenario: The search and the tabs share one row

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) |
    | 1                     | 7                          |
    ------------------------------------------------------ 
    And Each milestone has 4 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 1         | 2    |  0       | 0       | 0        |
    ------------------------------------------------------------
    And backlog has 2 issues
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 0           | 0         | 0    |  1       | 0       | 0        |
    ------------------------------------------------------------------------
    And There is custom callback for board issues
    When User navigates to app/project/project_1/board
    Then The board search and the milestone tabs share one row
