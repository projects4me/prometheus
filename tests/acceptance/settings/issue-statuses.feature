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
    Then The issue statuses table has the columns Status, Value, Counts as done, Issues
    And The issue statuses are listed in the order new, in_progress, done
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
    And User adds the issue status labelled QA Review with colour #f7bf65 counting as done
    Then The issue statuses are listed in the order new, qa_review
    And The issue status qa_review is listed with colour #f7bf65, counting as done Yes and 0 issues
    And The issue status qa_review is listed with the label QA Review
    And One request created the issue status qa_review with the labels {"en-us": "QA Review"}

  Scenario: An admin adds an issue status with a colour of their own

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    When User opens app/settings/issue-statuses
    And User starts adding an issue status
    Then The colour picker reads #80b5d3
    And The text colour reads Automatic
    When User types the en-us label Blocked
    And User picks the colour #6a3d9a with the colour picker
    Then The colour preview reads Blocked in colour #6a3d9a
    When User saves the issue status
    Then The issue status blocked is listed with colour #6a3d9a, counting as done No and 0 issues
    And The issue status blocked is listed with light label text
    And One request created the issue status blocked with the colour #6a3d9a and the text colour automatic

  Scenario: An admin chooses the label text colour of a status

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name | color   | done | sortOrder | issueCount |
    | new  | #fff3a0 | 0    | 1         | 3          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    Then The issue status new is listed with dark label text
    When User starts editing the issue status new
    Then The colour picker reads #fff3a0
    And The colour preview has dark text
    When User picks the text colour Light
    Then The colour preview has light text
    When User saves the issue status
    Then The issue status new is listed with light label text
    And The issue status new was saved with the text colour light

  Scenario: Label text follows the colour unless a text colour is chosen

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name    | color   | textColor | done | sortOrder | issueCount |
    | new     | #fff3a0 | -         | 0    | 1         | 3          |
    | blocked | #1a2b3c | -         | 0    | 2         | 1          |
    | waiting | #fff3a0 | light     | 0    | 3         | 0          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    Then The issue status new is listed with dark label text
    And The issue status blocked is listed with light label text
    And The issue status waiting is listed with light label text
    When User starts editing the issue status waiting
    Then The colour picker reads #fff3a0
    And The text colour reads Light

  Scenario: The status value is derived from the label until it is typed

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And Gaia offers the locales en-us, de-de
    When User opens app/settings/issue-statuses
    And User starts adding an issue status
    Then The dialog has a label field for en-us, de-de
    When User types the en-us label In Review 2!
    Then The value reads in_review_2
    When User types the value Waiting For The Customer To Reply Again
    Then The value reads waiting_for_the_customer_to_re
    When User types the en-us label Waiting
    And User types the de-de label Wartet
    And User saves the issue status
    Then The issue status waiting_for_the_customer_to_re is listed with the label Waiting
    And One request created the issue status waiting_for_the_customer_to_re with the labels {"en-us": "Waiting", "de-de": "Wartet"}

  Scenario: An issue status can't be saved without its en-us label

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    When User opens app/settings/issue-statuses
    And User starts adding an issue status
    And User types the value qa_review
    And User saves the issue status
    Then The issue status is not saved and the dialog stays open

  Scenario: An admin relabels a global issue status, its value can't change

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------
    | name        | color   | done | sortOrder | issueCount |
    | in_progress | #b3244f | 0    | 1         | 2          |
    ------------------------------------------------------------
    When User opens app/settings/issue-statuses
    Then The issue status in_progress is listed with the label In Progress
    When User starts editing the issue status in_progress
    Then The value reads in_progress
    And The value is read-only
    When User types the en-us label Working On It
    And User saves the issue status
    Then The issue status in_progress is listed with the label Working On It
    And The issue status in_progress was saved with the labels {"en-us": "Working On It"}

  Scenario: A global issue status is listed with the label saved in Gaia

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And The global issue statuses are
    ------------------------------------------------------------------------
    | name        | label        | color   | done | sortOrder | issueCount |
    | awaiting_qa | Awaiting QA  | #b3244f | 0    | 1         | 0          |
    | in_progress | Being Worked | #5ac594 | 0    | 2         | 1          |
    ------------------------------------------------------------------------
    When User opens app/settings/issue-statuses
    Then The issue status awaiting_qa is listed with the label Awaiting QA
    And The issue status in_progress is listed with the label Being Worked

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
    And The update of the issue status new sent no labels

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
