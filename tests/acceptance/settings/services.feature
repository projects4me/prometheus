@setupApplicationTest
Feature: Settings | services

  Scenario: The Services page lists the service clients

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceclient.update permission set to 1
    And The service clients are
    ------------------------------------------------------
    | name     | kind    | status   | lastUsedAt          |
    | talos-1  | runtime | active   | 2026-11-08 10:00:00 |
    | hermes-1 | hermes  | disabled | -                   |
    ------------------------------------------------------
    When User opens app/settings/services
    Then The services are listed in the order hermes-1, talos-1
    And The service talos-1 is listed as runtime, Active, last used 2026-11-08 10:00:00
    And The service hermes-1 is listed as hermes, Disabled, last used Never

  Scenario: The Services page has an empty state

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    When User opens app/settings/services
    Then The services page shows the empty state

  Scenario: An admin disables a service client after confirming

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceclient.update permission set to 1
    And The service clients are
    ------------------------------------------------------
    | name    | kind    | status | lastUsedAt            |
    | talos-1 | runtime | active | -                     |
    ------------------------------------------------------
    When User opens app/settings/services
    And User disables the service talos-1 and cancels
    Then The service talos-1 is listed as runtime, Active, last used Never
    When User disables the service talos-1 and confirms
    Then The service talos-1 is listed as runtime, Disabled, last used Never
    And The service client talos-1 is stored as disabled
