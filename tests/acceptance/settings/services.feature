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

  Scenario: An admin approves an enrollment request after checking the code

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceenrollment.get permission set to 1
    And User_1 has serviceenrollment.update permission set to 1
    And The enrollment requests are
    -----------------------------------------------
    | name    | kind    | userCode  | minutesLeft |
    | talos-2 | runtime | WXYZ-4321 | 10          |
    -----------------------------------------------
    When User opens app/settings/services
    Then The enrollment request talos-2 is listed with code WXYZ-4321
    When User approves the request talos-2 and cancels
    Then The enrollment request talos-2 is listed with code WXYZ-4321
    When User approves the request talos-2 and confirms
    Then The enrollment request talos-2 is no longer listed
    And The enrollment request talos-2 is stored as approved

  Scenario: An admin denies an enrollment request

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceenrollment.get permission set to 1
    And User_1 has serviceenrollment.update permission set to 1
    And The enrollment requests are
    -----------------------------------------------
    | name    | kind    | userCode  | minutesLeft |
    | talos-2 | runtime | WXYZ-4321 | 10          |
    -----------------------------------------------
    When User opens app/settings/services
    And User denies the request talos-2 and confirms
    Then The enrollment request talos-2 is no longer listed
    And The enrollment request talos-2 is stored as denied

  Scenario: An expired enrollment request cannot be approved

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceenrollment.get permission set to 1
    And User_1 has serviceenrollment.update permission set to 1
    And The enrollment requests are
    -----------------------------------------------
    | name    | kind    | userCode  | minutesLeft |
    | talos-3 | runtime | EXPD-0000 | -5          |
    -----------------------------------------------
    When User opens app/settings/services
    Then The enrollment request talos-3 is listed as expired without approve or deny

  Scenario: An admin creates an enrollment token and sees it once

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceenrollmenttoken.get permission set to 1
    And User_1 has serviceenrollmenttoken.create permission set to 1
    When User opens app/settings/services
    And User creates the enrollment token deploy-1
    Then The created token is shown with the single-use warning
    When User closes the created token
    Then The created token is not shown
    And The enrollment token deploy-1 is listed as runtime, Active

  Scenario: An admin revokes an enrollment token

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has serviceclient.get permission set to 1
    And User_1 has serviceenrollmenttoken.get permission set to 1
    And User_1 has serviceenrollmenttoken.delete permission set to 1
    And The enrollment tokens are
    -------------------------------------------
    | name     | kind    | used | minutesLeft |
    | deploy-1 | runtime | no   | 10          |
    | deploy-2 | hermes  | yes  | 10          |
    | deploy-3 | hermes  | no   | -5          |
    -------------------------------------------
    When User opens app/settings/services
    Then The enrollment token deploy-1 is listed as runtime, Active
    And The enrollment token deploy-2 is listed as hermes, Used
    And The enrollment token deploy-3 is listed as hermes, Expired
    When User revokes the enrollment token deploy-1
    Then The enrollment token deploy-1 is no longer listed
    And The enrollment token deploy-1 is no longer stored
