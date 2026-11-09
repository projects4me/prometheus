@setupApplicationTest
Feature: Role | role browser

  Background:
    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The roles in the system are
    ---------------------------------------------------------------------
    | name           | description            | dateModified        |
    | Astronaut      | Flies the rockets      | 2026-10-20 10:00:00 |
    | Ground Control | -                      | 2026-10-01 10:00:00 |
    | Mission Lead   | Leads the whole flight | 2026-09-15 10:00:00 |
    ---------------------------------------------------------------------

  Scenario: Landing on the roles opens the first role

    When User opens the roles page
    Then The role Astronaut is open
    And The role browser lists Astronaut, Ground Control, Mission Lead
    And The role browser count reads 3

  Scenario: A row shows the initials, access, description, members and date

    Given Role Ground Control denies issue.create
    And Role Astronaut has 3 members
    When User opens the roles page
    Then The role row Astronaut shows the initials A
    And The role row Ground Control shows the initials GC
    And The role row Astronaut shows 100% granted and no denied
    And The role row Ground Control shows a denied share
    And The role row Astronaut shows the description Flies the rockets
    And The role row Ground Control shows no description
    And The role row Astronaut shows 2 avatars and 1 more
    And The role row Mission Lead shows no members
    And The role row Astronaut shows the date 20 Oct 2026
    And The member query of the role browser names only the listed roles

  Scenario: Opening another role keeps the list

    When User opens the roles page
    And User opens the role Mission Lead
    Then The role Mission Lead is open
    And The role list was not requested again

  Scenario: Searching narrows the list and keeps the open role

    When User opens the roles page
    And User opens the role Mission Lead
    And User types "name ~ Astro" in the role search bar and presses Enter
    Then The role list was requested with "Role.name"
    And The role browser lists Astronaut
    And The role url keeps query
    And The role Mission Lead stays open

  Scenario: A search without matches tells so, and a matching one opens its first role

    When User opens the roles page with the search (Role.name CONTAINS Nobody)
    Then The roles page tells that no role matches
    And The role browser lists 0 roles
    When User types "name ~ Mission" in the role search bar and presses Enter
    Then The role Mission Lead is open

  Scenario: Grouping by access tier groups the loaded page from the most access

    Given Role Astronaut denies every action
    When User opens the roles page
    And User groups the role browser by tier
    Then The role browser shows the groups high, low
    And The role url keeps group

  Scenario: Deleting the open role opens the first listed role

    When User opens the roles page
    And User opens the role Astronaut
    And User deletes role from detail page
    Then The role Ground Control is open
    And The role browser lists Ground Control, Mission Lead
