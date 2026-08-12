@setupApplicationTest
Feature: Role | render users

  Scenario: Render and check list of users (userroles) associated with the given role

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 10 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    Then There should 10 userroles exists
    And View All members control should not be visible

  Scenario: Cap inline members at 10 and open View All modal with search

    Given There is no pre-existing data
    And default scenario is loaded
    And There are 10 roles in system
    And There are 10 projects in system
    And There are 15 userroles for role 2
    And User fetch userrole against roleId
    And User_1 is logged in
    When User navigates to app/role/2
    Then There should 10 userroles exists
    And View All members control should be visible
    When User clicks on View All members
    Then View All members modal should show 15 userroles
    When User searches role members for User_15
    Then View All members modal should show 1 userroles
    When User clears role members search
    Then View All members modal should show 15 userroles
    When User searches role members for zzznomatch
    Then View All members modal should show empty state
    When User closes View All members modal
    Then View All members modal should be closed
    And User should still be on role detail page 2
