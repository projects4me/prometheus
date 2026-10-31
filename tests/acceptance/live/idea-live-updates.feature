@setupApplicationTest
@setupHermesFake
Feature: Live | idea browser plan status

  Scenario: The browser label follows a plan status change pushed by Hermes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The ideas of the project are
    ---------------------------------------------------------
    | title        | status | dateModified        |
    | Planned idea | open   | 2026-10-01 10:00:00 |
    ---------------------------------------------------------
    And The plans of the idea Planned idea are
    ---------------------------
    | version | status        |
    | 1       | proposed      |
    ---------------------------
    When User opens the ideas of the project
    Then The idea Planned idea is labelled Plan proposed
    When The plan version 1 of the idea Planned idea is now created
    And Another user produces domain event "idea.plan.status.changed" with:
      -----------------------------------
      | key        | value              |
      | actorId    | user_a             |
      | projectId  | 1                  |
      | resourceType | ideaplan         |
      | resourceId | 1                  |
      -----------------------------------
    Then The idea Planned idea is labelled Issues created
