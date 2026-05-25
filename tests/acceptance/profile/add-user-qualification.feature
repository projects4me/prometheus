@setupApplicationTest
Feature: Profile | add user qualification

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User navigates to app/user/1

  Scenario: User adds an education qualification from empty state

    When User clicks add qualification button
    And User selects "education" as qualification type
    And User enters "BSCS" in qualification title field
    And User enters "MIT" in qualification institution field
    And User selects completion year "2020"
    And User saves qualification form
    Then User qualification title is "BSCS"
    And User qualification institution is "MIT"
    And User qualification year is "2020"
    And User qualification type icon is "education"

  Scenario: User adds a certification qualification

    When User adds certification qualification with title "AWS Solutions Architect", institution "Amazon", year "2023"
    Then User qualification title is "AWS Solutions Architect"
    And User qualification institution is "Amazon"
    And User qualification year is "2023"
    And User qualification type icon is "certification"

  Scenario: User sees messenger error when saving qualification without required fields

    When User clicks add qualification button
    And User saves qualification form without filling fields
    Then User sees qualification required fields messenger error
    And User qualification list is empty

  Scenario: User can cancel adding a qualification

    When User opens qualification add form
    And User enters "Draft Degree" in qualification title field
    And User cancels qualification form
    Then Qualification add form is not visible
    And User qualification list is empty
