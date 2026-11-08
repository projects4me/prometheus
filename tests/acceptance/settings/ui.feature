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

  Scenario: The QuickList showcase pages, groups, selects and switches states

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    When User opens app/settings/ui/quick-list
    Then The QuickList shows 20 rows
    And The QuickList pagination reads 1-20 / 45
    When User goes to the next QuickList page
    Then The QuickList pagination reads 21-40 / 45
    When User groups the QuickList by creator
    Then The QuickList shows 5 groups
    When User selects the first 2 QuickList rows
    Then The QuickList selection bar counts 2 selected
    When User clicks the QuickList archive selection action
    Then The QuickList selection bar is hidden
    When User filters the QuickList by Login
    Then The QuickList shows 2 rows
    When User switches the QuickList to the loading state
    Then The QuickList shows the loading state
    When User switches the QuickList to the empty state
    Then The QuickList shows the empty state
    When User switches the QuickList to the error state
    Then The QuickList shows the error state
