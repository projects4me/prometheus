@setupApplicationTest
Feature: User Management | change multiple user account status

  Scenario: Change the account status of a user to active

    Given There is no pre-existing data
    And default scenario is loaded 
    And User_1 is logged in
    When User navigates to app/user/management
    And User update account status of all users to active
    Then Account status of all users are set to active

  Scenario: Change the account status of a user to inactive

    Given There is no pre-existing data
    And default scenario is loaded 
    And User_1 is logged in
    When User navigates to app/user/management
    And User update account status of all users to inactive
    Then Account status of all users are set to inactive    