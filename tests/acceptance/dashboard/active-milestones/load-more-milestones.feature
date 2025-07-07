@setupApplicationTest
Feature: Dashboard - Active Milestones | load more milestones

  Scenario: loading more milestones with load more button - first click

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | milestone  |
    | 15         |
    --------------
    And There is need to paginate the milestones
    When User navigates to app
    And User clicks on load more button in active milestones widget
    #initial limit for milestones are 5 set in metadata
    Then There should be 10 milestones present in active milestones widget

  Scenario: loading more milestones with load more button - second click
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 selects Project 2
    And Project has following details
    --------------
    | milestone  |  
    | 15         |
    --------------
    And There is need to paginate the milestones
    When User navigates to app
    And User clicks on load more button in active milestones widget
    And User clicks on load more button in active milestones widget again
    Then There should be 15 milestones present in active milestones widget