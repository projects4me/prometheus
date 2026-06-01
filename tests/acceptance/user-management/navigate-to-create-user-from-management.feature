@setupApplicationTest
Feature: User Management | navigate to create user from management

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/management

  Scenario: Create user button is visible on management page

    Then User should see create user button on management page

  Scenario: Admin navigates to create user from management page

    When User clicks on create user button from management
    Then User should be in app/user/create page
    And User should see user create form on create page
