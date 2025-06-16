/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | gantt-chart/gantt-task-bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders task bar with basic properties', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'high',
        assignedTo: { name: 'John Doe' }
      },
      leftOffset: 100,
      width: 200,
      progress: 75,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('[data-test-task-bar]').exists('Task bar is rendered');
    assert.dom('.gantt-task-bar__text').hasText('Test Task');
    assert.dom('[data-test-task-bar]').hasClass('gantt-task-bar--high', 'High priority class is applied');
  });

  test('it handles click events', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    this.set('clickCalled', false);
    this.set('onTaskClick', (issue) => {
      this.set('clickCalled', true);
      this.set('clickedIssue', issue);
    });

    await render(hbs`
      <GanttChart::GanttTaskBar 
        @taskBar={{this.taskBar}} 
        @onTaskClick={{this.onTaskClick}}
      />
    `);

    await click('[data-test-task-bar]');
    
    assert.true(this.clickCalled, 'Click callback was called');
    assert.equal(this.clickedIssue.id, '1', 'Correct issue was passed to callback');
  });

  test('it handles double click events', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    this.set('editCalled', false);
    this.set('onTaskEdit', (issue) => {
      this.set('editCalled', true);
      this.set('editedIssue', issue);
    });

    await render(hbs`
      <GanttChart::GanttTaskBar 
        @taskBar={{this.taskBar}} 
        @onTaskEdit={{this.onTaskEdit}}
      />
    `);

    await triggerEvent('[data-test-task-bar]', 'dblclick');
    
    assert.true(this.editCalled, 'Edit callback was called');
    assert.equal(this.editedIssue.id, '1', 'Correct issue was passed to callback');
  });

  test('it shows hover state', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium',
        startDate: '2023-01-01',
        endDate: '2023-01-05'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    this.set('hoverCalled', false);
    this.set('onTaskHover', (issue, isHovered) => {
      this.set('hoverCalled', true);
      this.set('isHovered', isHovered);
    });

    await render(hbs`
      <GanttChart::GanttTaskBar 
        @taskBar={{this.taskBar}} 
        @onTaskHover={{this.onTaskHover}}
      />
    `);

    await triggerEvent('[data-test-task-bar]', 'mouseenter');
    
    assert.true(this.hoverCalled, 'Hover callback was called');
    assert.true(this.isHovered, 'Hover state is true');
    assert.dom('[data-test-task-bar]').hasClass('gantt-task-bar--hovered', 'Hover class is applied');
  });

  test('it displays progress correctly', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium'
      },
      leftOffset: 100,
      width: 200,
      progress: 60,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('.gantt-task-bar__progress-fill').hasStyle({
      width: '60%'
    }, 'Progress bar width is correct');
  });

  test('it shows resize handle for draggable tasks', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('[data-test-resize-handle]').exists('Resize handle is shown for draggable tasks');
  });

  test('it hides resize handle for non-draggable tasks', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: false
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('[data-test-resize-handle]').doesNotExist('Resize handle is hidden for non-draggable tasks');
  });

  test('it displays priority icons correctly', async function(assert) {
    // Test high priority
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'High Priority Task',
        priority: 'high'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#e74c3c',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('.gantt-task-bar__priority--high .fa-exclamation-triangle').exists('High priority icon is shown');

    // Test low priority
    this.set('taskBar.issue.priority', 'low');
    this.set('taskBar.color', '#95a5a6');

    assert.dom('.gantt-task-bar__priority--low .fa-arrow-down').exists('Low priority icon is shown');
  });

  test('it displays assignee avatar', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium',
        assignedTo: {
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg'
        }
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('.gantt-task-bar__avatar').exists('Avatar is displayed');
    assert.dom('.gantt-task-bar__avatar').hasAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('it displays initials when no avatar', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium',
        assignedTo: {
          name: 'John Doe'
        }
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('.gantt-task-bar__avatar--initials').exists('Initials avatar is displayed');
  });

  test('it shows connection points on hover', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium'
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('[data-test-connection-start]').exists('Start connection point exists');
    assert.dom('[data-test-connection-end]').exists('End connection point exists');
  });

  test('it applies status-based styling', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium',
        issuestatus: {
          get: function(prop) {
            if (prop === 'name') return 'in-progress';
            return null;
          }
        }
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#3498db',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('[data-test-task-bar]').hasClass('gantt-task-bar--in-progress', 'Status class is applied');
  });

  test('it applies overdue styling', async function(assert) {
    this.set('taskBar', {
      issue: {
        id: '1',
        subject: 'Test Task',
        priority: 'medium',
        isOverdue: true
      },
      leftOffset: 100,
      width: 200,
      progress: 50,
      color: '#e74c3c',
      isDraggable: true
    });

    await render(hbs`
      <GanttChart::GanttTaskBar @taskBar={{this.taskBar}} />
    `);

    assert.dom('[data-test-task-bar]').hasClass('gantt-task-bar--overdue', 'Overdue class is applied');
  });
});
