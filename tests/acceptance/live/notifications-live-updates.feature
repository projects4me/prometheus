@setupApplicationTest
@setupHermesFake
Feature: Live | notifications remote updates

  Scenario: User B receives a remote notification.created event
    Given There is no pre-existing data
    And default scenario is loaded
    And User_4 is logged in
    And There is no systemnotification
    When User navigates to app
    Then Hermes is connected with a fake socket
    And Hermes notifications intent is registered for the current user
    When Another user produces domain event "notification.created" with:
      ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      | key              | value                                                                                                                                                                         |
      | actorId          | user_a                                                                                                                                                                        |
      | projectId        | user:4                                                                                                                                                                        |
      | resourceId       | sn-remote-1                                                                                                                                                                   |
      | resourceType     | systemnotification                                                                                                                                                            |
      | recipientId      | snr-remote-1                                                                                                                                                                  |
      | recipientUserId  | 4                                                                                                                                                                             |
      | description      | {{User@42}} has updated the {{Issue@99}} status to {{status:done}}                                                                                                            |
      | context          | {"projectShortcode":"DEMO","issueNumber":"3664","issueStatus":"done","userId":"42","userName":"Ali Hassan","relatedTo":"issue"}                                               |
      | createdUser      | 42                                                                                                                                                                            |
      | createdUserName  | Ali Hassan                                                                                                                                                                    |
      ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    Then The notifications unread count is greater than 0
    And The latest notification context has userName "Ali Hassan" and issueNumber "3664"
