@setupApplicationTest
Feature: Role | render list of roles

  Scenario: Check the rendering of list of roles

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And User_1 is logged in
    When User navigates to app/role
    Then there are 10 roles present in the template