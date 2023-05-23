@setupApplicationTest
Feature: User Management | sort users

  Scenario: Sort list of users on the basis on name in descending order

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    #10 users are already created by default scenario
    And There are 30 users in system
    When User navigates to app/user/management
    #this will sort data according to type of the data.
    And User.name attribute has data of type stringWithNumber
    And User clicks on User.name heading to sort in desc order
    Then First record of user name is User_40

  Scenario: Sort list of users on the basis on name in ascending order

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    #10 users are already created by default scenario
    And There are 30 users in system
    When User navigates to app/user/management
    #this will sort data according to type of the data.
    And User.name attribute has data of type stringWithNumber
    And User clicks on User.name heading to sort in asc order
    Then First record of user name is User_1