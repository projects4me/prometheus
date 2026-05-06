@setupApplicationTest
Feature: Issue | restrict assignment to active users

  Scenario: Invited and inactive members are not selectable as assignee or owner

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 1
    And Project 1 has invited user 2 and inactive user 3 as members
    When User navigates to issue create page
    Then User 2 and User 3 are not listed in assignee options
    And User 2 and User 3 are not listed in owner options
