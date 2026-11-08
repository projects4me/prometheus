@setupApplicationTest
Feature: Settings | Developer UI

  Scenario: Settings shows Developer > UI, which opens the QuickList tab

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    When User opens app/settings
    Then The settings navigation shows the UI page
    When User opens app/settings/ui
    Then User lands on app/settings/ui/quick-list
    And The QuickList tab is active
    And The QuickList placeholder is shown
