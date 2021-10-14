@setupApplicationTest
Feature: issue create

  Scenario: Checking pre-filled fields

    Given User_4 is logged in
    Given Project 3 has 4 milestones
    When User navigates to issue create page
    # When User enters issue subject
    # When User enters issue description
    # When User selects issue type
    Then User_4 should be assignee
    Then User_4 should be owner
    # Then User_4 should be owner

  Scenario: Creating issue with simple values

    Given User_4 is logged in
    Given Project 3 has 4 milestones
    When User navigates to issue create page
    When User enters subject
    When User enters description
    When User selects type
    When User selects start date
