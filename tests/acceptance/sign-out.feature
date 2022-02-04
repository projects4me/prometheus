@setupApplicationTest
Feature: sign out

  Scenario: Signing out from application

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    When User navigates to app
    When User clicks on user menu in navbar
    When User clicks on signout button
    When User navigates to authenticated route
    Then User is redirected to signin route
