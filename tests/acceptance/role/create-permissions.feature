@setupApplicationTest
Feature: Role | create permissions

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And User_1 is logged in
    When User navigates to app/role
    And User selects role 2
    And User clicks on first module to check permissions

  Scenario: Create module action permission for issue.create

    When User sets action permission issue.create to 1
    And User saves issue module permissions
    Then Action permission issue.create is created for role 2 with allowed 1
    And Permission update success message is shown

  Scenario: Create field access permission for issue.subject

    When User opens fields tab for issue module
    And User sets field subject access to read
    And User saves issue module permissions
    Then Field permission issue.subject is created for role 2 with mode read
    And Field issue.subject triples for role 2 are get 1 create 0 update 0
    And Field subject access mode is read
    And Permission update success message is shown
