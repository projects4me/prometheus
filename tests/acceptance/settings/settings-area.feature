@setupApplicationTest
Feature: Settings | area shell

  Scenario: An admin moves around the Settings area from the side nav

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    When User opens app/settings
    Then User lands on app/settings/users
    And The sidebar shows the Settings entry
    And The sidebar does not show the Users and Roles entries
    And The settings navigation shows the Users page
    And The settings navigation shows the Roles page
    And The settings navigation highlights the Users page
    And The breadcrumb reads Dashboard > Settings > Users

  Scenario: A user without the setting permission cannot reach the Settings area

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 0
    When User opens app/settings
    Then The sidebar does not show the Settings entry
    And The access denied page is shown
