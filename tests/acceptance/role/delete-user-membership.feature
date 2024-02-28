@setupApplicationTest
Feature: Role | delete user membership

  Scenario: Delete user's membership associated with the role

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 memberships for role 2
    # Below test case is used to set the mirage request object
    # by letting the endpoint know that "roleId" is used in query
    And User fetch membership against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    And User clicks on user tab
    And User delete membership 1
    Then There should 9 memberships exists