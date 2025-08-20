@setupApplicationTest
Feature: Issue Planning | AI-assisted plan and hierarchical creation

  Scenario: User loads issue plan and sees hierarchical tasks
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
    And There is custom callback for issue planning data
    And User opens Issue Planning modal
    Then The issue planning tree should render with parents and children

  Scenario: User toggles tasks and dependencies
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
    And There is custom callback for issue planning data
    And User opens Issue Planning modal
    And User unchecks task TASK-1
    Then TASK-2 parent is disabled
    And User checks task TASK-1
    And TASK-2 parent is enabled
    And User unchecks task TASK-2
    And TASK-3 parent is disabled

  Scenario: User starts plan and sees progress states
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------    
    And Project has issue type of Sub Task and status of new
    And There is custom callback for issue
    And Disable modal close for testing
    When User navigates to app/project/PROJECT_1/issue/1
    And There is custom callback for issue planning data
    And User opens Issue Planning modal
    And There is no custom callback
    And User starts the issue plan
    And Setup parent issue relationship for issue 3 with issue 1
    And User navigates to app/project/PROJECT_1/issue/3
    Then The parent of issue 3 should be issue 1

  Scenario: User retries a failed task and its subtree
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And Project has issue type of Sub Task and status of new
    And There is custom callback for issue
    When User navigates to app/project/PROJECT_1/issue/1
    And There is custom callback for issue planning data    
    And User opens Issue Planning modal
    And There is custom callback for issue creation failure
    And User starts the issue plan
    And A task fails during creation
    And There is no custom callback
    And User retries the failed task
    Then The failed task and its children are created

  Scenario: User copies a failed task subtree to clipboard
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    --------------
    | issue    |
    | 1        |
    --------------
    And Project has issue type of Sub Task and status of new
    And There is custom callback for issue
    When User navigates to app/project/PROJECT_1/issue/1
    And There is custom callback for issue planning data    
    And User opens Issue Planning modal
    And There is custom callback for issue creation failure
    And User starts the issue plan
    And A task fails during creation
    And User copies the failed task to clipboard
    Then Clipboard should contain the JSON of the task and its children