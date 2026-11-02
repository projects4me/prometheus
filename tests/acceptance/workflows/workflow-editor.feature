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

  Scenario: A filter step is built from the trigger's fields and saved with its conditions

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User adds a filter step from the palette
    And User adds the condition issue.status equals Done
    And User applies the step
    And User saves the workflow
    Then The filter step of workflow 1 has the config {"conditions":[{"field":"issue.status","operator":"equals","value":"Done"}]}

  Scenario: A run agent step picks its agent and fills its prompt from the event

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    And There is an agent named Agent Odysseus
    When User opens app/workflow/1
    And User adds a run_agent step from the palette
    And User picks Agent Odysseus as the agentId
    And User types Fix in the prompt setting
    And User inserts issue.subject into the prompt
    And User applies the step
    And User saves the workflow
    Then The run_agent step of workflow 1 has the config {"agentId":"1","prompt":"Fix {issue.subject}"}

  Scenario: Each case of a switch becomes an output

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User adds a switch step from the palette
    And User adds the case urgent
    Then The step shows the outputs urgent, default

  Scenario: A step's settings stay unapplied until Apply

    Given There is no pre-existing data
    And default scenario is loaded
    And User_1 is logged in
    And The Draft workflow Triage starts with an issue.created trigger
    When User opens app/workflow/1
    And User adds a notify step from the palette
    And User types Ping in the message setting
    And User saves the workflow
    Then The notify step of workflow 1 has the config {}
