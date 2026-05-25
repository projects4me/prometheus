@setupApplicationTest
Feature: Profile | add user skill

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User has skill "EmberJS" with proficiency "intermediate"
    When User navigates to app/user/1

  Scenario: User adds a skill from empty state

    When User clicks add skill button
    And User enters "Rust" in skill name field
    And User selects "advanced" as skill proficiency
    And User saves skill form
    Then User skill "Rust" is displayed
    And User skill "Rust" has proficiency "Adv"
    And User has 2 skills

  Scenario: User sees validation when adding duplicate skill name

    When User opens skill add form
    And User enters "EmberJS" in skill name field
    And User selects "expert" as skill proficiency
    And User saves skill form
    Then User sees duplicate skill validation error
    And User has 1 skills

  Scenario: User can cancel adding a skill

    When User opens skill add form
    And User enters "Temporary" in skill name field
    And User cancels skill form
    Then Skill add form is not visible
    And User has 1 skills
