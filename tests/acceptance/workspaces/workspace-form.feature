@setupApplicationTest
Feature: Workspaces | create and edit

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in

  Scenario: User creates a workspace

    When User navigates to app/workspace/create
    And User fills the workspace form with name "Engineering", code "ENG" and description "All engineers"
    And User clicks on the workspace save button
    Then User should be in app/workspace/ENG page
    And Workspace "Engineering" with code "ENG" is stored

  Scenario: User edits a workspace

    Given Workspace "Engineering" with code "ENG" exists
    When User navigates to app/workspace/ENG/settings/projects
    And User fills the workspace form with name "Platform", code "ENG" and description "Platform team"
    And User clicks on the workspace save button
    Then Workspace "Platform" with code "ENG" is stored

  Scenario: Short code is required

    When User navigates to app/workspace/create
    And User fills the workspace form with name "Engineering" and no code
    And User clicks on the workspace save button
    Then User should be in app/workspace/create page

  Scenario: Gaia reports a duplicate code and the input is kept

    Given Workspace "Engineering" with code "ENG" exists
    When User navigates to app/workspace/create
    And User fills the workspace form with name "Other", code "ENG" and description "Kept"
    And User clicks on the workspace save button
    Then The workspace form shows the error "The short code is already in use"
    And The workspace form keeps name "Other" and code "ENG"

  Scenario: User cancels

    When User navigates to app/workspace/create
    And User clicks on the workspace cancel button
    Then User should be in app/workspace page
