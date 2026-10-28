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
    | bug  | Something broke | 4            |
    | task | A unit of work  | 2            |
    -------------------------------------------
    When User opens app/settings/issue-types
    Then The issue types table lists 2 types
    And The issue types table has the columns Label, Value, Description, Projects using
    And The issue type bug is listed with description Something broke and 4 projects using it
    And The issue types info note is shown
    And The breadcrumb reads Dashboard > Settings > Issue Types

  Scenario: An admin adds a default issue type

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    When User opens app/settings/issue-types
    And User adds the issue type labelled Change Request with description Make it better
    Then The issue types table lists 1 types
    And The issue type change_request is listed with the label Change Request
    And The issue type change_request is listed with description Make it better and 0 projects using it
    And One request created the issue type change_request with the labels {"en-us": "Change Request"}

  Scenario: The type value is derived from the label until it is typed, with a label per locale

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And Gaia offers the issue type locales en-us, de-de
    When User opens app/settings/issue-types
    And User starts adding an issue type
    Then The issue type dialog has a label field for en-us, de-de
    When User types the issue type en-us label Sub Task 2!
    Then The issue type value reads sub_task_2
    When User types the issue type value Waiting For The Customer To Reply Again
    Then The issue type value reads waiting_for_the_customer_to_re
    When User types the issue type en-us label Waiting
    And User types the issue type de-de label Wartet
    And User saves the issue type
    Then The issue type waiting_for_the_customer_to_re is listed with the label Waiting
    And One request created the issue type waiting_for_the_customer_to_re with the labels {"en-us": "Waiting", "de-de": "Wartet"}

  Scenario: An admin relabels a default issue type, its value can't change

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The default issue types are
    --------------------------------------------------------
    | name | label | description     | projectCount |
    | bug  | Bug   | Something broke | 4            |
    --------------------------------------------------------
    When User opens app/settings/issue-types
    And User starts editing the issue type bug
    Then The issue type value reads bug
    And The issue type value is read-only
    When User types the issue type en-us label Defect
    And User saves the issue type
    Then The issue type bug is listed with the label Defect
    And The issue type bug is listed with description Something broke and 4 projects using it
    And The issue type bug was saved with the labels {"en-us": "Defect"}

  Scenario: An issue type is listed with the label saved in Gaia

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And The default issue types are
    --------------------------------------------------------
    | name     | label    | description | projectCount |
    | story    | User Story | A story   | 1            |
    | unlabelled |          | None      | 0            |
    --------------------------------------------------------
    When User opens app/settings/issue-types
    Then The issue type story is listed with the label User Story
    And The issue type unlabelled is listed with the label unlabelled

  Scenario: Saving a description only does not resend the labels

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The default issue types are
    --------------------------------------------------------
    | name | label | description     | projectCount |
    | bug  | Bug   | Something broke | 4            |
    --------------------------------------------------------
    When User opens app/settings/issue-types
    And User starts editing the issue type bug
    And User types the issue type description Still broken
    And User saves the issue type
    Then The update of the issue type bug sent no labels

  Scenario: An admin deletes a default issue type

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The default issue types are
    -------------------------------------------
    | name | description     | projectCount |
    | bug  | Something broke | 4            |
    | task | A unit of work  | 2            |
    -------------------------------------------
    When User opens app/settings/issue-types
    And User deletes the issue type bug
    Then The issue types table lists 1 types
    And The issue type bug is not listed

  Scenario: An issue type cannot be added without its en-us label

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    When User opens app/settings/issue-types
    And User starts adding an issue type
    And User types the issue type value no_label
    And User saves the issue type
    Then The issue type is not saved and the dialog stays open
    And A validation error is shown
