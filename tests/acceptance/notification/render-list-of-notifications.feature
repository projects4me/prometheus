@setupApplicationTest
Feature: Notificatoin | render list of notifications

  Scenario: viewing the notifications sidebar when there are notifications
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 5 systemnotifications in system
    When User navigates to app
    And User clicks on notifications icon
    Then There are 5 notifications present inside sidebar

  Scenario: loading more notifications with infinite scroll
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There are 15 systemnotifications in system
    When User navigates to app
    And User clicks on notifications icon
    And User scrolls to the bottom of notifications list
    Then More notifications should be loaded

  Scenario: viewing empty state when no notifications
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There is no systemnotification
    When User navigates to app
    And User clicks on notifications icon
    Then User should see empty notifications message
