@setupApplicationTest
#UNCOMMON steps: tests/acceptance/steps/app/auth-status-steps.js
Feature: App | auth status page

  Scenario: Auth status page renders when signed out

    Given There is no pre-existing data
    And default scenario is loaded
    When User visits the auth status page
    Then User should be on the auth status page
    And Auth status should show authenticated "No"

  Scenario: Auth status page renders when signed in

    Given There is no pre-existing data
    And default scenario is loaded
    And User 1 is logged in
    When User visits the auth status page
    Then User should be on the auth status page
    And Auth status should show authenticated "Yes"

  Scenario: Clear session button empties the session

    Given There is no pre-existing data
    And default scenario is loaded
    And User 1 is logged in
    When User visits the auth status page
    And User clicks clear session on the auth status page
    Then The stored session should be empty
