@setupApplicationTest
Feature: Role | role browser paging

  Scenario: The browser lists 20 roles a page and opens the next page from the URL

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And There are 21 roles named in order
    When User opens the roles page
    Then The role browser lists 20 roles
    And The next page button of the role browser is enabled
    When User opens the next page of the role browser
    Then The role browser lists Role 21
    And The role url keeps page
    And The next page button of the role browser is disabled
