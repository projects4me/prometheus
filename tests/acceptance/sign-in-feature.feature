@setupApplicationTest
Feature: sign in feature

  Scenario: Signing in to application

    Given User is not logged in
    When User enters hammad in username
    When User enters hammad in password
    When User click on signin button
    Then User should be in app page

  Scenario: Sigining in to application with wrong password

    Given User is not logged in
    When User enters hammad in username
    When User enters hamma in password
    When User click on signin button
    Then User should be in signin page