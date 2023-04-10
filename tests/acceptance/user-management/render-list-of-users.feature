@setupApplicationTest
Feature: User Management | render list of user

  Scenario: Verify the rendering of list of users in user management route

    Given There is no pre-existing data
    And default scenario is loaded 
    #default scenario creates 10 user.
    And User_1 is logged in
    When User navigates to app/user/management
    Then There are 10 users present inside list view