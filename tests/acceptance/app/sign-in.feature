@setupApplicationTest
Feature: App | sign in

  Scenario: Signing in to application

    Given There is no pre-existing data
    And default scenario is loaded
    And User is not logged in
    When User enters hammad in username
    And User enters hammad in password
    And User click on signin button
    Then User should be in app page

  Scenario: Sigining in to application with wrong password
  
    Given There is no pre-existing data
    And default scenario is loaded
    And User is not logged in
    When User enters hammad in username
    And User enters hamma in password
    And User click on signin button
    Then User should be in signin page