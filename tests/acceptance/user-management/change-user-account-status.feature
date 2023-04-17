@setupApplicationTest
Feature: User Management | change user account status

  Scenario: Change the account status of a user

    Given There is no pre-existing data
    And default scenario is loaded 
    #default scenario creates 10 user.
    And User_1 is logged in
    And User 3 account status is active
    When User navigates to app/user/management
    And User change account status of User 3
    Then User 3 account status is changed to inactive