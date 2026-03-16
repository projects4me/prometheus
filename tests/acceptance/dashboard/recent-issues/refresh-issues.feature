@setupApplicationTest
Feature: Dashboard - Recent Issues | refresh issues

  Scenario: Refresh button is visible in the Recent Issues widget header

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 5          |
    --------------
    When User navigates to app
    Then Refresh button should be visible in recent issues widget

  Scenario: Refresh surfaces a new issue added to the server after initial load

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    When User navigates to app
    And A new issue is added to the server
    And User clicks on refresh button in recent issues widget
    Then There should be 11 issues present in recent issues widget

  Scenario: Refresh after load more resets displayed data back to page 1

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 20         |
    --------------
    And There is need to paginate the issues
    When User navigates to app
    And User clicks on load more button in recent issues widget
    And User clicks on refresh button in recent issues widget
    Then There should be 5 issues present in recent issues widget

  Scenario: Load more after refresh fetches page 2 not the previous page

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 20         |
    --------------
    And There is need to paginate the issues
    When User navigates to app
    And User clicks on load more button in recent issues widget
    And User clicks on refresh button in recent issues widget
    And User clicks on load more button in recent issues widget
    Then There should be 10 issues present in recent issues widget

  Scenario: Load more works again after refresh when end of pages was reached

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | issue      |
    | 10         |
    --------------
    And There is need to paginate the issues
    When User navigates to app
    And User clicks on load more button in recent issues widget
    And User clicks on load more button in recent issues widget again
    And User clicks on refresh button in recent issues widget
    And User clicks on load more button in recent issues widget
    Then There should be 10 issues present in recent issues widget
