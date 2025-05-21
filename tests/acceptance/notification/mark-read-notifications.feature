@setupApplicationTest
Feature: Notification | mark read notifications

  Scenario: marking a notification as read
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And There are 5 systemnotifications in system with unread status
    When User navigates to app
    And User clicks on notifications icon
    And User clicks on first unread notification
    Then The notification should be marked as read

  Scenario: marking all notifications as read
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 10 projects in system
    And There are 5 systemnotifications in system with unread status
    When User navigates to app
    And User clicks on notifications icon
    And User clicks on mark all as read button
    Then All notifications should be marked as read