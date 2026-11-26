@setupApplicationTest
Feature: Gantt | a failed request does not fail the page

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has following details
    ------------------------------------------------------------------------------
    | milestones(milestone) | issuestatuses(issuestatus) | issuetypes(issuetype) |
    | 2                     | 7                          | 4                     |
    ------------------------------------------------------------------------------
    And Each milestone has 2 issues and there status are
    ------------------------------------------------------------------------
    | new | in_progress | in_review | done | feedback | pending | deferred |
    | 1   | 1           | 0         | 0    |  0       | 0       | 0        |
    ------------------------------------------------------------------------

  Scenario: A milestone whose issues fail to load stays empty and the others render

    Given The issues of the first gantt milestone answer 404
    When User navigates to app/project/project_1/gantt
    Then The gantt shows 2 milestone rows
    And The gantt shows the warning "Some milestones could not be loaded." once

  Scenario: A failed time log request still renders the chart

    Given The gantt time log requests answer 404
    When User navigates to app/project/project_1/gantt
    Then The gantt shows 2 milestone rows

  Scenario: A failed milestones request shows the empty Gantt with an error

    Given The gantt milestones request answers 404
    When User navigates to app/project/project_1/gantt
    Then The gantt shows no milestone and no error page
    And The gantt shows the error message "The milestones could not be loaded."

  Scenario: A 403 on the milestones request goes to access denied

    Given The gantt milestones request answers 403
    When User opens the gantt and is redirected
    Then The gantt went to the access denied page
