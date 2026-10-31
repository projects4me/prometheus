@setupApplicationTest
Feature: Workflows | edit the flow of a workflow

  Scenario: Adding and connecting steps saves the new nodes and edges

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User adds a filter step from the palette
    And User connects the next port of the issue.created step to the filter step
    And User adds a end step from the palette
    And User connects the pass port of the filter step to the end step
    And User saves the workflow
    Then The workflow 1 has the steps issue.created, filter, end
    And The workflow 1 has the connections issue.created next filter, filter pass end

  Scenario: Removing a connection deletes it on save

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User adds a end step from the palette
    And User connects the next port of the issue.created step to the end step
    And User saves the workflow
    And User selects the connection from the next port
    And User removes the selected connection
    And User saves the workflow
    Then The workflow 1 has the steps issue.created, end
    And The workflow 1 has no connections

  Scenario: The steps of an Active workflow can't be changed

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Active workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User adds a filter step from the palette
    Then The canvas shows the steps issue.created
    And The canvas says the steps are locked

  Scenario: A new workflow is created with its steps and opens on its page

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User opens app/workflow/create
    And User enters Escalate in the workflow name
    And User adds a issue.created step from the palette
    And User adds a end step from the palette
    And User connects the next port of the issue.created step to the end step
    And User saves the workflow
    Then The workflow Escalate is saved as a Draft
    And The workflow 1 has the steps issue.created, end
    And The workflow 1 has the connections issue.created next end
    And User is on the page of workflow 1

  Scenario: A workflow without a name is not saved

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    When User opens app/workflow/create
    And User adds a issue.created step from the palette
    And User saves the workflow
    Then No workflow is saved

  Scenario: A step Gaia refuses is marked with its message and stays unsaved

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    And Gaia refuses new steps with config.conditions is required for filter.
    When User opens app/workflow/1
    And User adds a filter step from the palette
    And User saves the workflow
    Then The workflow 1 has the steps issue.created
    And The filter step shows the message config.conditions is required for filter.
