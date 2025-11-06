@setupApplicationTest
Feature: Breadcrumb | breadcrumb functionality

  Scenario: Breadcrumb builds correct trail for nested routes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    When User navigates to app/project/project_1/issue
    Then Breadcrumb should be displayed
    And Breadcrumb should have 4 items
    And Breadcrumb item 0 should be "Dashboard"
    And Breadcrumb item 1 should be "Projects"
    And Breadcrumb item 2 should be "project_1"
    And Breadcrumb item 3 should be "Issues"
    And Breadcrumb item 3 should have icon "tasks"
    And Breadcrumb item 3 should not be linkable
    And Breadcrumb item 3 should have active class

  Scenario: Breadcrumb displays dynamic title from project model
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    When User navigates to app/project/project_1
    Then Breadcrumb should be displayed
    And Breadcrumb should have 3 items
    And Breadcrumb item 0 should be "Dashboard"
    And Breadcrumb item 1 should be "Projects"
    And Breadcrumb item 2 should be "project_1"
    And Breadcrumb item 2 should have icon "briefcase"
    And Breadcrumb item 2 should not be linkable
    And Breadcrumb item 2 should have active class

  Scenario: Breadcrumb handles nested routes with multiple route parameters
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has issue with number "123"
    And There is custom callback for issue
    When User navigates to app/project/project_1/issue/edit/123
    Then Breadcrumb should be displayed
    And Breadcrumb should have 6 items
    And Breadcrumb item 0 should be "Dashboard"
    And Breadcrumb item 1 should be "Projects"
    And Breadcrumb item 2 should be "project_1"
    And Breadcrumb item 3 should be "Issues"
    And Breadcrumb item 4 should be "#123"
    And Breadcrumb item 5 should be "Edit Issue"
    And Breadcrumb item 5 should have icon "pencil"
    And Breadcrumb item 5 should not be linkable
    And Breadcrumb item 5 should have active class

  Scenario: Breadcrumb displays translated text for route labels
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    When User navigates to app/project/project_1/wiki
    Then Breadcrumb should be displayed
    And Breadcrumb should have 4 items
    And Breadcrumb item 3 should be "Wiki"
    And Breadcrumb item 3 should have icon "book"
    And Breadcrumb item 3 should not be linkable
    And Breadcrumb item 3 should have active class

  Scenario: Breadcrumb links navigate correctly to parent routes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has issue with number "123"
    And There is custom callback for issue
    When User navigates to app/project/project_1/issue/123
    Then Breadcrumb should be displayed
    When User clicks on "Projects" breadcrumb
    Then User should be in app/project page
    When User navigates to app/project/project_1/issue/123
    And User clicks on "project_1" breadcrumb
    Then User should be in app/project/project_1 page
    When User navigates to app/project/project_1/issue/123
    And User clicks on "Issues" breadcrumb
    Then User should be in app/project/project_1/issue page

  Scenario: Breadcrumb displays correctly for user management routes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    When User navigates to app/user/management
    Then Breadcrumb should be displayed
    And Breadcrumb should have 2 items
    And Breadcrumb item 0 should be "Dashboard"
    And Breadcrumb item 1 should be "User Management"
    And Breadcrumb item 1 should have icon "users"
    And Breadcrumb item 1 should not be linkable
    And Breadcrumb item 1 should have active class

  Scenario: Breadcrumb displays correctly for create routes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    When User navigates to app/project/project_1/issue/create
    Then Breadcrumb should be displayed
    And Breadcrumb should have 5 items
    And Breadcrumb item 4 should be "Create Issue"
    And Breadcrumb item 4 should have icon "plus"
    And Breadcrumb item 4 should not be linkable
    And Breadcrumb item 4 should have active class

  Scenario: Breadcrumb items have correct linkable state
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And User_4 selects Project 1
    And Project has issue with number "123"
    And There is custom callback for issue
    When User navigates to app/project/project_1/issue/123
    Then Breadcrumb should be displayed
    And Breadcrumb should have 5 items
    And Breadcrumb item 0 should be linkable
    And Breadcrumb item 1 should be linkable
    And Breadcrumb item 2 should be linkable
    And Breadcrumb item 3 should be linkable
    And Breadcrumb item 4 should not be linkable

