@setupApplicationTest
Feature: App | translations

  Scenario: A backend translation overrides the static one

    Given There is no pre-existing data
    And default scenario is loaded
    And Gaia translates "views.signin.remember" as "Keep me signed in" in "en-us"
    When User navigates to signin
    Then The remember me label should read "Keep me signed in"

  Scenario: The app boots with the static translations when the translations endpoint fails

    Given There is no pre-existing data
    And default scenario is loaded
    And The translations endpoint fails
    When User navigates to signin
    Then The remember me label should read "Remember Me"
    And The app locale should be "en-us"

  Scenario: A signed-in user gets their language when Gaia supports it

    Given There is no pre-existing data
    And default scenario is loaded
    And Gaia supports the locales "en-us,de-de"
    And Gaia translates "views.signin.remember" as "Angemeldet bleiben" in "de-de"
    And The language of User_4 is "de"
    And User_4 is logged in
    When User navigates to app
    Then The app locale should be "de-de"

  Scenario: A signed-in user whose language Gaia doesn't support gets en-us

    Given There is no pre-existing data
    And default scenario is loaded
    And The language of User_4 is "fr"
    And User_4 is logged in
    When User navigates to app
    Then The app locale should be "en-us"
