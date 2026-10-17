@setupApplicationTest
Feature: Settings | issue types

  Scenario: The Issue Types page lists the default types with the projects using them

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The default issue types are
    -------------------------------------------
    | name | description     | projectCount |
    | Bug  | Something broke | 4            |
    | Task | A unit of work  | 2            |
    -------------------------------------------
    When User opens app/settings/issue-types
    Then The issue types table lists 2 types
    And The issue type Bug is listed with description Something broke and 4 projects using it
    And The issue types info note is shown
    And The breadcrumb reads Dashboard > Settings > Issue Types

  Scenario: An admin adds a default issue type

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    When User opens app/settings/issue-types
    And User adds the issue type Improvement with description Make it better
    Then The issue types table lists 1 types
    And The issue type Improvement is listed with description Make it better and 0 projects using it

  Scenario: An admin edits a default issue type

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The default issue types are
    -------------------------------------------
    | name | description     | projectCount |
    | Bug  | Something broke | 4            |
    -------------------------------------------
    When User opens app/settings/issue-types
    And User renames the issue type Bug to Defect
    Then The issue types table lists 1 types
    And The issue type Defect is listed with description Something broke and 4 projects using it

  Scenario: An admin deletes a default issue type

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The default issue types are
    -------------------------------------------
    | name | description     | projectCount |
    | Bug  | Something broke | 4            |
    | Task | A unit of work  | 2            |
    -------------------------------------------
    When User opens app/settings/issue-types
    And User deletes the issue type Bug
    Then The issue types table lists 1 types
    And The issue type Bug is not listed

  Scenario: An issue type cannot be added without a name

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    When User opens app/settings/issue-types
    And User saves a new issue type with only the description No name
    Then The issue types table lists 0 types
    And A validation error is shown
