@setupApplicationTest
Feature: App | Document title

  Scenario: Browser tab shows page label only for non-project admin routes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    When User navigates to app/user/management
    Then Browser tab title should contain "User Management"
    And Browser tab title should not contain "PROJECT"

  Scenario: Browser tab shows page label with project shortcode on project routes
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And User_4 selects Project 1
    When User navigates to app/project/project_1/issue
    Then Browser tab title should contain "Issues"
    And Browser tab title should contain "PROJECT_1"

  Scenario: Browser tab shows issue number on issue detail page
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And User_4 selects Project 1
    And There are 1 issues in system
    When User navigates to app/project/project_1/issue/1
    Then Browser tab title should contain "#1"
    And Browser tab title should contain "PROJECT_1"

  Scenario: Browser tab title updates when user switches project
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And User_4 selects Project 1
    When User navigates to app/project/project_1/issue
    And User selects project 2 from sidebar
    Then Browser tab title should contain "PROJECT_2"
    And Browser tab title should not contain "PROJECT_1"

  Scenario: Browser tab shows notification count badge when there are unread notifications
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And User_4 selects Project 1
    And There are 3 systemnotifications in system with unread status
    When User navigates to app/project/project_1/issue
    Then Browser tab title should contain "(3)"

  Scenario: Browser tab notification badge disappears after marking all notifications as read
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And User_4 selects Project 1
    And There are 3 systemnotifications in system with unread status
    When User navigates to app
    And User clicks on notifications icon
    And User clicks on mark all as read button
    Then Browser tab title should not contain "(3)"

  Scenario: Browser tab shows static fallback title on unauthenticated pages
    Given There is no pre-existing data
    And User is not logged in
    Then Browser tab title should be "Projects4Me"
