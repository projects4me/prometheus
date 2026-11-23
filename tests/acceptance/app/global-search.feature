@setupApplicationTest
Feature: Application | global search

  Scenario: Searching the issue globally

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And there are 10 issues in the application
    When User navigates to app
    And User clicks on global search
    And User search for Issue Test 3
    And User selects Issue Test 3
    Then User is navigated to Issue 3 detail view

  Scenario: The global search says when matching by meaning is unavailable

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And there are 10 issues in the application
    And the search cannot match by meaning
    When User navigates to app
    And User clicks on global search
    And User search for Issue Test 3
    Then the global search lists Issue Test 3 only
    And the global search says only word matches are shown
