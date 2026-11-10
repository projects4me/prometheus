@setupApplicationTest
Feature: open conversation in a sidepanel

  Scenario: Adding a comment of existing conversations

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    Then User should see the conversation 1 in the sidepanel

  Scenario: The thread page shows the thread box and the linked issue box

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    Then User should see the thread box and the linked issue box of conversation 1


  Scenario: A discussion shows its newest comments and loads the older ones on demand

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    And Conversation 1 is a discussion with 12 comments
    And Conversation 2 is a discussion with 4 comments
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    Then User should see comments 3 to 12 of the thread and can load older comments
    When User loads the older comments of the thread
    Then User should see comments 1 to 12 of the thread and no older comments to load

  Scenario: A reply appears as the newest comment of the thread

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    And Conversation 1 is a discussion with 3 comments
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    And User add a comment having description testReply
    Then The reply testReply is the newest of 4 comments of the thread

  Scenario: The linked issue box shows the issue of the thread

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    And Conversation 1 is linked to issue 101 with subject Fix the login page
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    Then The linked issue box shows issue 101 with subject Fix the login page

  Scenario: The linked issue box says when the thread has no linked issue

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project has following details
    -----------------------------------
    | conversations(conversationroom) |
    | 5                               |
    -----------------------------------
    When User navigates to app/project/PROJECT_1
    And User clicks on conversation 1 from latest conversations section
    Then The linked issue box says there is no linked issue
