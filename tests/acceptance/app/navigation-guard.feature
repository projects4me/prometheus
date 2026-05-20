@setupApplicationTest
Feature: App | navigation guard

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    When User navigates to app/user/create
    And The navigation guard is initialized

  Scenario: User should be blocked from navigating away from a dirty form

    When User enters test@test.com in email field
    And User clicks on dashboard from the sidebar
    Then User should be in app/user/create page

  Scenario: User should be able to navigate away from a clean form

    When User clicks on dashboard from the sidebar
    Then User should be in app page

  Scenario: User should be able to navigate away from a dirty form

    When User enters test@test.com in email field
    And User clicks on dashboard from the sidebar
    And User clicks on the navigation guard confirm button
    Then User should be in app page