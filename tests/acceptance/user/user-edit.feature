@setupApplicationTest
Feature: User | Inline edit user profile fields

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/1

  Scenario: User can inline edit their name

    When User clicks on name field to edit
    And User edits name to "Updated Name"
    And User saves inline edit
    Then User name should be "Updated Name"

  Scenario: User sees validation error when saving an empty name

    When User clicks on name field to edit
    And User clears name field
    And User saves inline edit
    Then User should see name validation error

  Scenario: User can cancel inline edit without saving

    When User clicks on name field to edit
    And User edits name to "Temporary Name"
    And User cancels inline edit
    Then User name should not be "Temporary Name"

  Scenario: User can inline edit their designation

    When User clicks on designation field to edit
    And User edits designation to "Senior Engineer"
    And User saves inline edit
    Then User designation should be "Senior Engineer"

  Scenario: User can inline edit their timezone

    When User clicks on timezone field to edit
    And User selects "UTC" from timezone dropdown
    And User saves inline edit
    Then User timezone should be "UTC"
