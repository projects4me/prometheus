@setupApplicationTest
Feature: Application | global search

  Scenario: Searching the issue globally

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    Given there are 10 issues in the application
    When User navigates to app
    When User clicks on global serach
    When User search for Issue Test 3
    When User selects Issue Test 3
    Then User is navigated to Issue 3 detail view