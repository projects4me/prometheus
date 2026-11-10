@setupApplicationTest
#UNCOMMON steps: tests/acceptance/steps/app/auth-flows-steps.js
Feature: App | auth flows

  Scenario: Signing in through the form stores the OAuth tokens in the session

    Given There is no pre-existing data
    And default scenario is loaded
    And User 1 has an active account with email auth-flows@test.local
    And User is not logged in
    When User signs in through the form with email auth-flows@test.local and password valid-password
    Then User lands on the app route
    And The session is authenticated
    And The session holds an access token, a refresh token and an expiry

  Scenario: Signed out deep link goes to signin, then into the app after signing in

    Given There is no pre-existing data
    And default scenario is loaded
    And User 1 has an active account with email auth-flows@test.local
    When Signed out user visits a project deep link
    Then User is sent to the signin route
    When User signs in through the form with email auth-flows@test.local and password valid-password
    Then User lands on the project deep link

  Scenario: Signed in user visiting signin is sent to app

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    When Signed in user visits the signin route
    Then User lands on the app route

  Scenario: Signing out ends the session

    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And Sign-out reloads are recorded
    When User navigates to app
    And User clicks on user menu in navbar
    And User clicks on signout button
    Then The session is not authenticated
    And The app is reloaded at the root URL
    When User navigates to authenticated route
    Then User is redirected to signin route
