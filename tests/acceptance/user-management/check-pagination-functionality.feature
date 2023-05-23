@setupApplicationTest
Feature: User Management | check pagination functionality

  Scenario: Render list of users and check the pagination functionality

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 11 users in system
    When User navigates to app/user/management
    And User clicks on next button
    Then There will be 1 record present inside list view