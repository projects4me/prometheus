@setupApplicationTest
Feature: User Management | delete a user

  Scenario: Delete one of the user from given list of users.

    Given There is no pre-existing data
    And default scenario is loaded 
    #default scenario creates 10 user.
    And User_1 is logged in
    When User navigates to app/user/management
    When User delete a user of id 1
    Then User of id 1 is not present inside list