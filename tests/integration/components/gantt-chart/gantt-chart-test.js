/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | gantt-chart/gantt-chart', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with empty state', async function(assert) {
    this.set('issues', []);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-gantt-chart]').exists('Gantt chart container exists');
    assert.dom('[data-test-gantt-empty]').exists('Empty state is shown');
    assert.dom('.gantt-chart__empty-title').hasText('No tasks available');
  });

  test('it renders with loading state', async function(assert) {
    this.set('issues', []);
    this.set('isLoading', true);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-gantt-loading]').exists('Loading state is shown');
    assert.dom('.gantt-chart__spinner').exists('Loading spinner is present');
  });

  test('it renders with issues data', async function(assert) {
    // Mock issues data
    this.set('issues', [
      {
        id: '1',
        subject: 'Task 1',
        startDate: '2023-01-01',
        endDate: '2023-01-05',
        priority: 'high',
        progressPercentage: 50,
        assignedTo: { name: 'John Doe' }
      },
      {
        id: '2',
        subject: 'Task 2',
        startDate: '2023-01-03',
        endDate: '2023-01-08',
        priority: 'medium',
        progressPercentage: 25,
        assignedTo: { name: 'Jane Smith' }
      }
    ]);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-gantt-chart]').exists('Gantt chart container exists');
    assert.dom('[data-test-gantt-container]').exists('Main container exists');
    assert.dom('[data-test-gantt-timeline]').exists('Timeline component exists');
    assert.dom('[data-test-task-row]').exists({ count: 2 }, 'Two task rows are rendered');
    
    // Check task content
    assert.dom('[data-test-task-row="0"] .gantt-chart__task-subject').hasText('Task 1');
    assert.dom('[data-test-task-row="1"] .gantt-chart__task-subject').hasText('Task 2');
  });

  test('time scale selection works', async function(assert) {
    this.set('issues', []);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    // Test initial state (should default to weeks)
    assert.dom('[data-test-time-scale-select]').hasValue('weeks');

    // Change to days
    await fillIn('[data-test-time-scale-select]', 'days');
    assert.dom('[data-test-time-scale-select]').hasValue('days');

    // Change to months
    await fillIn('[data-test-time-scale-select]', 'months');
    assert.dom('[data-test-time-scale-select]').hasValue('months');
  });

  test('zoom controls work', async function(assert) {
    this.set('issues', []);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    // Test zoom out (should change to months)
    await click('[data-test-zoom-out]');
    assert.dom('[data-test-time-scale-select]').hasValue('months');

    // Test zoom in (should change to days)
    await click('[data-test-zoom-in]');
    assert.dom('[data-test-time-scale-select]').hasValue('days');
  });

  test('task selection works', async function(assert) {
    this.set('issues', [
      {
        id: '1',
        subject: 'Task 1',
        startDate: '2023-01-01',
        endDate: '2023-01-05',
        priority: 'high',
        progressPercentage: 50
      }
    ]);
    this.set('isLoading', false);
    this.set('selectedTask', null);
    this.set('onTaskSelect', (task) => {
      this.set('selectedTask', task);
    });

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
        @onTaskSelect={{this.onTaskSelect}}
      />
    `);

    // Click on task row
    await click('[data-test-task-row="0"]');
    
    assert.equal(this.selectedTask.id, '1', 'Task selection callback was called');
    assert.dom('[data-test-task-row="0"]').hasClass('gantt-chart__task-row--selected', 'Task row is selected');
  });

  test('task progress is displayed correctly', async function(assert) {
    this.set('issues', [
      {
        id: '1',
        subject: 'Task 1',
        startDate: '2023-01-01',
        endDate: '2023-01-05',
        priority: 'high',
        progressPercentage: 75
      }
    ]);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-task-row="0"] .gantt-chart__progress-text').hasText('75%');
    assert.dom('[data-test-task-row="0"] .gantt-chart__progress-fill').hasStyle({
      width: '75%'
    });
  });

  test('priority styling is applied correctly', async function(assert) {
    this.set('issues', [
      {
        id: '1',
        subject: 'High Priority Task',
        startDate: '2023-01-01',
        endDate: '2023-01-05',
        priority: 'high',
        progressPercentage: 50
      },
      {
        id: '2',
        subject: 'Low Priority Task',
        startDate: '2023-01-03',
        endDate: '2023-01-08',
        priority: 'low',
        progressPercentage: 25
      }
    ]);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-task-row="0"] .gantt-chart__task-priority').hasClass('gantt-chart__task-priority--high');
    assert.dom('[data-test-task-row="1"] .gantt-chart__task-priority').hasClass('gantt-chart__task-priority--low');
  });

  test('milestones are rendered when provided', async function(assert) {
    this.set('issues', []);
    this.set('milestones', [
      {
        id: '1',
        name: 'Release 1.0',
        startDate: '2023-01-15'
      },
      {
        id: '2',
        name: 'Beta Release',
        startDate: '2023-01-10'
      }
    ]);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @milestones={{this.milestones}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-milestone]').exists({ count: 2 }, 'Two milestones are rendered');
    assert.dom('[data-test-milestone="1"]').hasAttribute('title', 'Release 1.0 - 2023-01-15');
  });

  test('today line is rendered', async function(assert) {
    this.set('issues', []);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-today-line]').exists('Today line is rendered');
  });

  test('create task button works in empty state', async function(assert) {
    this.set('issues', []);
    this.set('isLoading', false);
    this.set('createTaskCalled', false);
    this.set('onCreateTask', () => {
      this.set('createTaskCalled', true);
    });

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
        @onCreateTask={{this.onCreateTask}}
      />
    `);

    assert.dom('[data-test-create-task]').exists('Create task button exists');
    
    await click('[data-test-create-task]');
    assert.true(this.createTaskCalled, 'Create task callback was called');
  });

  test('task count is displayed correctly', async function(assert) {
    this.set('issues', [
      { id: '1', subject: 'Task 1', startDate: '2023-01-01', endDate: '2023-01-05' },
      { id: '2', subject: 'Task 2', startDate: '2023-01-03', endDate: '2023-01-08' },
      { id: '3', subject: 'Task 3', startDate: '2023-01-05', endDate: '2023-01-10' }
    ]);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('.gantt-chart__task-count').containsText('3', 'Task count shows correct number');
  });

  test('assignee information is displayed', async function(assert) {
    this.set('issues', [
      {
        id: '1',
        subject: 'Task 1',
        startDate: '2023-01-01',
        endDate: '2023-01-05',
        assignedTo: { 
          name: 'John Doe',
          get: function(prop) { return this[prop]; }
        }
      }
    ]);
    this.set('isLoading', false);

    await render(hbs`
      <GanttChart::GanttChart 
        @issues={{this.issues}}
        @isLoading={{this.isLoading}}
      />
    `);

    assert.dom('[data-test-task-row="0"] .gantt-chart__task-meta').containsText('John Doe');
    assert.dom('[data-test-task-row="0"] .fa-user').exists('User icon is present');
  });
});
