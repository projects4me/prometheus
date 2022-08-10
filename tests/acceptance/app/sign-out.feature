@setupApplicationTest
Feature: App | sign out

  Scenario: Signing out from application

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    When User navigates to app
    And User clicks on user menu in navbar
    And User clicks on signout button
    And User navigates to authenticated route
    Then User is redirected to signin route
