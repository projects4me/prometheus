@setupApplicationTest
Feature: Developer | Component Library

  Scenario: An admin opens the Component Library from the Admin nav

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    When User opens app
    Then The sidebar shows the Developer item
    When User opens app/developer
    Then User lands on app/developer/components/quick-list
    And The Developer Components box shows the quick-list entry under Lists
    And The Developer Components box marks the quick-list entry active
    And The Developer page shows the quick-list entry
    When User opens app/developer/components
    Then User lands on app/developer/components/quick-list

  Scenario: The search filters the Components box

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    When User opens app/developer/components/quick-list
    And User searches the Developer components for no-such-thing
    Then The Developer Components box shows no entries
    When User searches the Developer components for narrow list
    Then The Developer Components box shows the quick-list entry under Lists

  Scenario: An unknown component name shows an error box with a way back

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    When User opens app/developer/components/no-such-component
    Then The Developer page says the component is not found
    When User follows the Developer link back to the first component
    Then User lands on app/developer/components/quick-list

  Scenario: A user without the setting permission cannot reach the Component Library

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 0
    When User opens app/developer/components/quick-list
    Then The sidebar does not show the Developer item
    And The access denied page is shown
