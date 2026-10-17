@setupApplicationTest
Feature: Settings | issue statuses

  Scenario: The Issue Statuses page lists the global statuses in board order

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name        | color   | done | sortOrder | issueCount |
    | in_progress | #b3244f | 0    | 2         | 64         |
    | new         | #80b5d3 | 0    | 1         | 220        |
    | done        | #5ac594 | 1    | 3         | 280        |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    Then The issue statuses are listed in the order new, in_progress, done
    And The issue status new is listed with colour #80b5d3, counting as done No and 220 issues
    And The issue status done is listed with colour #5ac594, counting as done Yes and 280 issues
    And The breadcrumb reads Dashboard > Settings > Issue Statuses

  Scenario: An admin adds a global issue status

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name | color   | done | sortOrder | issueCount |
    | new  | #80b5d3 | 0    | 1         | 3          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    And User adds the issue status qa_review with colour #f7bf65 counting as done
    Then The issue statuses are listed in the order new, qa_review
    And The issue status qa_review is listed with colour #f7bf65, counting as done Yes and 0 issues

  Scenario: An admin recolours a global issue status

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name | color   | done | sortOrder | issueCount |
    | new  | #80b5d3 | 0    | 1         | 3          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    And User changes the colour of the issue status new to #5ac594
    Then The issue status new is listed with colour #5ac594, counting as done No and 3 issues

  Scenario: An admin reorders the global issue statuses

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name        | color   | done | sortOrder | issueCount |
    | new         | #80b5d3 | 0    | 1         | 3          |
    | in_progress | #b3244f | 0    | 2         | 2          |
    | done        | #5ac594 | 1    | 3         | 1          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    And User drags the issue status done to position 1
    Then The issue statuses are listed in the order done, new, in_progress
    And The saved sort order of the issue statuses is done, new, in_progress

  Scenario: A global issue status that issues use cannot be deleted

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name     | color   | done | sortOrder | issueCount |
    | new      | #80b5d3 | 0    | 1         | 3          |
    | deferred | #f7bf65 | 0    | 2         | 0          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    Then Deleting the issue status new is disabled with an explanation
    When User deletes the issue status deferred
    Then The issue statuses are listed in the order new
