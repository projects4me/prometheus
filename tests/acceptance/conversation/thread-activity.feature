@setupApplicationTest
Feature: Threads | activity box

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 2                               |
    -----------------------------------

  Scenario: A discussion shows its newest 5 activities, a sentence per kind, and Show more loads the rest

    Given Conversation 1 has the activities
    ----------------------------------------------------------------------------------------------------
    | type     | field       | user | oldIssueNumber | newIssueNumber | dateCreated         |
    | created  |             | Rana |                |                | 2026-01-01 10:00:00 |
    | updated  | subject     | Rana |                |                | 2026-01-02 10:00:00 |
    | updated  | description | Rana |                |                | 2026-01-03 10:00:00 |
    | linked   | issueId     | Rana |                | 12             | 2026-01-04 10:00:00 |
    | linked   | issueId     | Rana | 12             | 15             | 2026-01-05 10:00:00 |
    | unlinked | issueId     | Rana | 15             |                | 2026-01-06 10:00:00 |
    ----------------------------------------------------------------------------------------------------
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then The Activity box lists 5 rows, newest first
    And The Activity box row 1 reads "User_Rana cleared the linked issue #15"
    And The Activity box row 2 reads "User_Rana changed the linked issue from #12 to #15"
    And The Activity box row 3 reads "User_Rana linked issue #12"
    And The Activity box row 4 reads "User_Rana edited the description"
    And The Activity box row 5 reads "User_Rana edited the subject"
    When User shows more activities
    Then The Activity box lists 6 rows, newest first
    And The Activity box row 6 reads "User_Rana started the thread"
    And The Activity box has no Show more button

  Scenario: A vote thread says the vote was started

    Given Conversation 1 is a vote thread with 0 agree votes and 0 disagree votes
    And Conversation 1 has the activities
    ----------------------------------------------------------
    | type    | user | dateCreated         |
    | created | Rana | 2026-01-01 10:00:00 |
    ----------------------------------------------------------
    When User navigates to app/project/PROJECT_1
    And User opens the vote thread 1 from the latest conversations
    Then The Activity box lists 1 rows, newest first
    And The Activity box row 1 reads "User_Rana started the vote"
