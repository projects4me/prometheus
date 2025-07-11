/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, triggerKeyEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | query-builder-native/query-builder-native', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    // Mock filters data similar to issue metadata
    this.set('filters', [
      {
        id: 'Issue.subject',
        label: 'Subject',
        type: 'string',
        operators: ['equal', 'not_equal', 'contains', 'not_contains']
      },
      {
        id: 'Issue.status',
        label: 'Status',
        type: 'string',
        input: 'select',
        values: {
          'new': 'New',
          'in_progress': 'In Progress',
          'done': 'Done'
        },
        operators: ['equal', 'not_equal']
      },
      {
        id: 'Issue.priority',
        label: 'Priority',
        type: 'string',
        input: 'select',
        values: {
          'low': 'Low',
          'medium': 'Medium',
          'high': 'High'
        },
        operators: ['equal', 'not_equal']
      },
      {
        id: 'Issue.startDate',
        label: 'Start Date',
        type: 'date',
        operators: ['equal', 'less', 'greater', 'between', 'is_null']
      }
    ]);

    this.set('query', '');
    this.set('onQueryChange', (newQuery) => {
      this.set('query', newQuery);
    });
  });

  test('it renders with empty state in visual mode', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
        @title="Test Query Builder"
      />
    `);

    assert.dom('[data-test-query-builder]').exists('Query builder container exists');
    assert.dom('.query-builder-native').exists('Main component class is applied');
    assert.dom('.card-header h5').containsText('Test Query Builder', 'Title is displayed');
    
    // Check mode toggle buttons
    assert.dom('[data-test-mode-visual]').exists('Visual mode button exists');
    assert.dom('[data-test-mode-text]').exists('Text mode button exists');
    assert.dom('[data-test-mode-visual]').hasClass('btn-primary', 'Visual mode is active by default');
    
    // Check empty state
    assert.dom('[data-test-empty-state]').exists('Empty state is shown');
    assert.dom('.fa-filter').exists('Filter icon is present');
    assert.dom('[data-test-add-rule]').exists('Add rule button exists');
  });

  test('it switches between visual and text modes', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Initially in visual mode
    assert.dom('.query-builder-visual').exists('Visual mode is displayed');
    assert.dom('.query-builder-text').doesNotExist('Text mode is not displayed');

    // Switch to text mode
    await click('[data-test-mode-text]');
    
    assert.dom('.query-builder-text').exists('Text mode is displayed');
    assert.dom('.query-builder-visual').doesNotExist('Visual mode is not displayed');
    assert.dom('[data-test-mode-text]').hasClass('btn-primary', 'Text mode button is active');
    assert.dom('[data-test-mode-visual]').hasClass('btn-outline-primary', 'Visual mode button is inactive');

    // Switch back to visual mode
    await click('[data-test-mode-visual]');
    
    assert.dom('.query-builder-visual').exists('Visual mode is displayed again');
    assert.dom('.query-builder-text').doesNotExist('Text mode is not displayed');
  });

  test('it adds and removes rules in visual mode', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add first rule
    await click('[data-test-add-rule]');
    
    assert.dom('[data-test-query-rule]').exists({ count: 1 }, 'One rule is added');
    assert.dom('[data-test-empty-state]').doesNotExist('Empty state is hidden');
    
    // Add second rule
    await click('[data-test-add-rule]');
    
    assert.dom('[data-test-query-rule]').exists({ count: 2 }, 'Two rules are added');
    assert.dom('[data-test-rules-connection]').exists('Rules connection selector appears');
    
    // Remove first rule
    await click('[data-test-query-rule]:first-child [data-test-remove-rule]');
    
    assert.dom('[data-test-query-rule]').exists({ count: 1 }, 'One rule remains');
    assert.dom('[data-test-rules-connection]').doesNotExist('Rules connection selector is hidden');
  });

  test('it configures rule fields, operators, and values', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add a rule
    await click('[data-test-add-rule]');
    
    const ruleSelector = '[data-test-query-rule]:first-child';
    
    // Select field
    await fillIn(`${ruleSelector} [data-test-field-select]`, 'Issue.subject');
    
    assert.dom(`${ruleSelector} [data-test-operator-select]`).isNotDisabled('Operator select is enabled');
    assert.dom(`${ruleSelector} [data-test-operator-select] option`).exists({ count: 5 }, 'Correct operators are available'); // including empty option
    
    // Select operator
    await fillIn(`${ruleSelector} [data-test-operator-select]`, 'contains');
    
    assert.dom(`${ruleSelector} [data-test-value-input]`).isNotDisabled('Value input is enabled');
    
    // Enter value
    await fillIn(`${ruleSelector} [data-test-value-input]`, 'bug');
    
    assert.dom(`${ruleSelector} [data-test-value-input]`).hasValue('bug', 'Value is set correctly');
  });

  test('it handles select field types with predefined values', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add a rule
    await click('[data-test-add-rule]');
    
    const ruleSelector = '[data-test-query-rule]:first-child';
    
    // Select status field (which has predefined values)
    await fillIn(`${ruleSelector} [data-test-field-select]`, 'Issue.status');
    await fillIn(`${ruleSelector} [data-test-operator-select]`, 'equal');
    
    // Should show select dropdown instead of text input
    assert.dom(`${ruleSelector} [data-test-value-select]`).exists('Value select dropdown exists');
    assert.dom(`${ruleSelector} [data-test-value-input]`).doesNotExist('Text input is not shown');
    
    // Check options
    assert.dom(`${ruleSelector} [data-test-value-select] option[value="new"]`).exists('New status option exists');
    assert.dom(`${ruleSelector} [data-test-value-select] option[value="in_progress"]`).exists('In Progress status option exists');
  });

  test('it handles date field types correctly', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add a rule
    await click('[data-test-add-rule]');
    
    const ruleSelector = '[data-test-query-rule]:first-child';
    
    // Select date field
    await fillIn(`${ruleSelector} [data-test-field-select]`, 'Issue.startDate');
    await fillIn(`${ruleSelector} [data-test-operator-select]`, 'greater');
    
    // Should show date input
    assert.dom(`${ruleSelector} [data-test-value-input]`).hasAttribute('type', 'date', 'Date input type is set');
  });

  test('it shows AND/OR connection options for multiple rules', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add two rules
    await click('[data-test-add-rule]');
    await click('[data-test-add-rule]');
    
    // Connection selector should appear
    assert.dom('[data-test-rules-connection]').exists('Rules connection selector exists');
    assert.dom('[data-test-connection-and]').exists('AND button exists');
    assert.dom('[data-test-connection-or]').exists('OR button exists');
    assert.dom('[data-test-connection-and]').hasClass('btn-success', 'AND is selected by default');
    
    // Switch to OR
    await click('[data-test-connection-or]');
    
    assert.dom('[data-test-connection-or]').hasClass('btn-warning', 'OR is now selected');
    assert.dom('[data-test-connection-and]').hasClass('btn-outline-success', 'AND is deselected');
  });

  test('it displays query preview in visual mode', async function(assert) {
    this.set('query', "((Issue.subject CONTAINS 'bug') AND (Issue.priority : 'high'))");
    
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add a rule to trigger preview
    await click('[data-test-add-rule]');
    
    assert.dom('[data-test-query-preview]').exists('Query preview section exists');
    assert.dom('[data-test-query-preview] code').exists('Generated query is shown');
  });

  test('it provides autocomplete in text mode', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Switch to text mode
    await click('[data-test-mode-text]');
    
    assert.dom('[data-test-query-textarea]').exists('Query textarea exists');
    assert.dom('.autocomplete-input').exists('Autocomplete wrapper exists');
    
    // Type to trigger autocomplete
    await fillIn('[data-test-query-textarea]', 'Issue.');
    await triggerKeyEvent('[data-test-query-textarea]', 'keyup', 'Period');
    
    // Note: Full autocomplete testing would require more complex setup
    // This tests the basic structure
    assert.dom('[data-test-query-textarea]').hasValue('Issue.', 'Text input works');
  });

  test('it shows syntax help in text mode', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Switch to text mode
    await click('[data-test-mode-text]');
    
    assert.dom('[data-test-syntax-help]').exists('Syntax help accordion exists');
    
    // Expand help
    await click('[data-test-syntax-help] .accordion-button');
    
    assert.dom('[data-test-syntax-help] .accordion-body').exists('Help content is shown');
    assert.dom('[data-test-syntax-help] code').exists('Code examples are present');
  });

  test('it validates query syntax in text mode', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Switch to text mode
    await click('[data-test-mode-text]');
    
    // Enter invalid query (unbalanced parentheses)
    await fillIn('[data-test-query-textarea]', '((Issue.subject CONTAINS bug)');
    
    // Should show validation error
    assert.dom('.alert-danger').exists('Error alert is shown');
    assert.dom('[data-test-query-textarea]').hasClass('is-invalid', 'Textarea has invalid class');
  });

  test('it clears all rules', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add some rules
    await click('[data-test-add-rule]');
    await click('[data-test-add-rule]');
    
    assert.dom('[data-test-query-rule]').exists({ count: 2 }, 'Two rules exist');
    
    // Clear all
    await click('[data-test-clear-all]');
    
    assert.dom('[data-test-query-rule]').doesNotExist('All rules are cleared');
    assert.dom('[data-test-empty-state]').exists('Empty state is shown again');
  });

  test('it adds and manages rule groups', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add a group
    await click('[data-test-add-group]');
    
    assert.dom('[data-test-query-group]').exists({ count: 1 }, 'One group is added');
    assert.dom('[data-test-query-group] .card-header').containsText('Group', 'Group header is shown');
    
    // Group should have its own add rule button
    assert.dom('[data-test-query-group] [data-test-add-rule]').exists('Group has add rule button');
  });

  test('it calls onChange callback when query is modified', async function(assert) {
    let changeCallCount = 0;
    this.set('onQueryChange', (newQuery) => {
      changeCallCount++;
      this.set('query', newQuery);
    });

    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Add a rule - should trigger onChange
    await click('[data-test-add-rule]');
    
    assert.ok(changeCallCount > 0, 'onChange callback was called');
  });

  test('it handles keyboard navigation in autocomplete', async function(assert) {
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Switch to text mode
    await click('[data-test-mode-text]');
    
    // Focus textarea
    await click('[data-test-query-textarea]');
    
    // Test escape key (should not throw error)
    await triggerKeyEvent('[data-test-query-textarea]', 'keydown', 'Escape');
    
    assert.dom('[data-test-query-textarea]').isFocused('Textarea remains focused after escape');
  });

  test('it preserves query when switching modes', async function(assert) {
    // Start with a query
    this.set('query', "((Issue.subject CONTAINS 'test'))");
    
    await render(hbs`
      <QueryBuilderNative::QueryBuilderNative 
        @filters={{this.filters}}
        @query={{this.query}}
        @onChange={{this.onQueryChange}}
      />
    `);

    // Should parse and show in visual mode
    assert.dom('[data-test-query-rule]').exists('Rule is parsed and shown');
    
    // Switch to text mode
    await click('[data-test-mode-text]');
    
    // Should show the query text
    assert.dom('[data-test-query-textarea]').hasValue("((Issue.subject CONTAINS 'test'))", 'Query is preserved in text mode');
    
    // Switch back to visual mode
    await click('[data-test-mode-visual]');
    
    // Should still show the rule
    assert.dom('[data-test-query-rule]').exists('Rule is still shown after mode switch');
  });
});
