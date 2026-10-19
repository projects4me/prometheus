@setupApplicationTest
Feature: Settings | email

  Scenario: The Email page shows the saved SMTP settings and never the password

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The email settings are
    ---------------------------------------------------------------------------------------------------
    | host             | port | encryption | username | password | fromName | fromEmail            |
    | smtp.example.com | 587  | tls        | mailer   | s3cret   | Pr4M     | no-reply@example.com |
    ---------------------------------------------------------------------------------------------------
    When User opens app/settings/email
    Then The email field host shows smtp.example.com
    And The email field port shows 587
    And The email field username shows mailer
    And The email field fromEmail shows no-reply@example.com
    And The email password field is empty and shows that a password is saved
    And The sent emails box is shown
    And The breadcrumb reads Dashboard > Settings > Email

  Scenario: An admin saves the SMTP settings

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The email settings are
    ---------------------------------------------------------------------------------------------------
    | host             | port | encryption | username | password | fromName | fromEmail            |
    | smtp.example.com | 587  | tls        | mailer   | s3cret   | Pr4M     | no-reply@example.com |
    ---------------------------------------------------------------------------------------------------
    When User opens app/settings/email
    And User fills the email field host with mail.other.com
    And User fills the email field port with 465
    And User saves the email settings
    Then The email setting host is stored as mail.other.com
    And The email setting port is stored as 465
    And The email setting password is stored as s3cret

  Scenario: A new password is saved write-only

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The email settings are
    ---------------------------------------------------------------------------------------------------
    | host             | port | encryption | username | password | fromName | fromEmail            |
    | smtp.example.com | 587  | tls        | mailer   |          | Pr4M     | no-reply@example.com |
    ---------------------------------------------------------------------------------------------------
    When User opens app/settings/email
    And User fills the email field password with n3w-secret
    And User saves the email settings
    Then The email setting password is stored as n3w-secret
    And The email password field is empty and shows that a password is saved

  Scenario: The SMTP settings are validated before they are saved

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And User_1 has setting.get permission set to 1
    And User_1 has setting.update permission set to 1
    And The email settings are
    ---------------------------------------------------------------------------------------------------
    | host             | port | encryption | username | password | fromName | fromEmail            |
    | smtp.example.com | 587  | tls        | mailer   | s3cret   | Pr4M     | no-reply@example.com |
    ---------------------------------------------------------------------------------------------------
    When User opens app/settings/email
    And User clears the email field host
    And User fills the email field port with 99999
    And User saves the email settings
    Then A validation error is shown
    And The email setting host is stored as smtp.example.com
