@setupApplicationTest
Feature: Role | create membership

  Scenario: Create a system membership for a user

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships for role 2
    And User fetch membership against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    And User clicks on create membership button
    And User selects option 1 of membership user
    And User clicks on save button
    Then There should 11 memberships exists
    And Membership is created for system

  Scenario: Create a (one) project membership for a user

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships for role 2
    And User fetch membership against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    And User clicks on create membership button
    And User selects option 1 of membership user
    # Project will be selected as a relatedTo
    And User selects option 2 of membership relatedTo
    And User selects option 3 of membership project
    And User clicks on save button
    Then There should 11 memberships exists

  Scenario: Create multiple projects membership for a user

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships for role 2
    And User fetch membership against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    And User clicks on create membership button
    And User selects option 1 of membership user
    # Project will be selected as a relatedTo
    And User selects option 2 of membership relatedTo
    And User selects option 1 of membership project
    And User selects option 2 of membership project
    And User selects option 3 of membership project
    And User selects option 4 of membership project
    And User selects option 5 of membership project
    And User clicks on save button
    Then There should 15 memberships exists