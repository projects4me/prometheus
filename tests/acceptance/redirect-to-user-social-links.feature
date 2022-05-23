@setupApplicationTest
Feature: redirect to user social links

  Scenario: Redirecting users to their social links

    Given There is no pre-existing data
    Given default scenario is loaded
    Given User_4 is logged in
    When User navigates to app/user/4
    When User clicks on github url, then its url is github.com/4
    When User clicks on gitlab url, then its url is gitlab.com/4
    When User clicks on skype url, then its url is skype:4?chat
    When User clicks on linkedin url, then its url is linkedin.com/in/4
    When User clicks on slack url, then its url is https://slack.com/app_redirect?channel=4