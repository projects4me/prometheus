@setupApplicationTest
Feature: Project dashboard | milestones box pages from the server

  Scenario: The box requests the first page only and pages forward

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 9 milestones
    When User opens the dashboard of the project
    Then The milestones box requested page 1 with limit 5
    And The milestones box lists the milestones Milestone 09, Milestone 08, Milestone 07, Milestone 06, Milestone 05
    And The milestones pager reads 1-5 / 5+
    And The milestones previous button is disabled
    When User pages the milestones box forward
    Then The milestones box requested page 2 with limit 5
    And The milestones box lists the milestones Milestone 04, Milestone 03, Milestone 02, Milestone 01
    And The milestones pager reads 6-9 / 9
    And The milestones next button is disabled

  Scenario: Five milestones or fewer show no pager

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 5 milestones
    When User opens the dashboard of the project
    Then The milestones box lists the milestones Milestone 05, Milestone 04, Milestone 03, Milestone 02, Milestone 01
    And The milestones pager is not shown

  Scenario: Without milestones the empty state shows

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 0 milestones
    When User opens the dashboard of the project
    Then The milestones box shows the empty state
    And The milestones pager is not shown

  Scenario: The chart dropdown still lists every milestone

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 9 milestones
    When User opens the dashboard of the project
    Then The chart milestone dropdown lists 9 milestones

  Scenario: A failed page shows the error and retry

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User selects Project 1
    And The project has 9 milestones
    And The second page of milestones fails to load
    When User opens the dashboard of the project
    And User pages the milestones box forward
    Then The milestones box shows the error
    When The second page of milestones loads again
    And User retries the milestones page
    Then The milestones box lists the milestones Milestone 04, Milestone 03, Milestone 02, Milestone 01
