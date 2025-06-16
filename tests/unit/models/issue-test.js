/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | issue', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('issue', {});
    assert.ok(model);
  });

  test('duration calculation works correctly', function(assert) {
    let store = this.owner.lookup('service:store');
    
    // Test with valid start and end dates
    let issue = store.createRecord('issue', {
      startDate: '2023-01-01',
      endDate: '2023-01-05'
    });
    
    assert.equal(issue.duration, 4, 'Duration should be 4 days');
    
    // Test with same start and end date
    issue.set('endDate', '2023-01-01');
    assert.equal(issue.duration, 1, 'Duration should be minimum 1 day for same date');
    
    // Test with missing end date
    issue.set('endDate', null);
    assert.equal(issue.duration, 1, 'Duration should default to 1 day when end date is missing');
    
    // Test with missing start date
    issue.set('startDate', null);
    assert.equal(issue.duration, 1, 'Duration should default to 1 day when start date is missing');
  });

  test('progressPercentage calculation based on status', function(assert) {
    let store = this.owner.lookup('service:store');
    
    // Mock issue status
    let doneStatus = store.createRecord('issuestatus', {
      name: 'done',
      done: '1'
    });
    
    let inProgressStatus = store.createRecord('issuestatus', {
      name: 'in-progress',
      done: '0'
    });
    
    let newStatus = store.createRecord('issuestatus', {
      name: 'new',
      done: '0'
    });
    
    let issue = store.createRecord('issue', {});
    
    // Test done status
    issue.set('issuestatus', doneStatus);
    assert.equal(issue.progressPercentage, 100, 'Done status should return 100% progress');
    
    // Test in-progress status
    issue.set('issuestatus', inProgressStatus);
    assert.equal(issue.progressPercentage, 50, 'In-progress status should return 50% progress');
    
    // Test new status
    issue.set('issuestatus', newStatus);
    assert.equal(issue.progressPercentage, 0, 'New status should return 0% progress');
    
    // Test no status
    issue.set('issuestatus', null);
    assert.equal(issue.progressPercentage, 0, 'No status should return 0% progress');
  });

  test('dependencyIds parsing works correctly', function(assert) {
    let store = this.owner.lookup('service:store');
    let issue = store.createRecord('issue', {});
    
    // Test with comma-separated IDs
    issue.set('dependencies', '1,2,3');
    assert.deepEqual(issue.dependencyIds, ['1', '2', '3'], 'Should parse comma-separated IDs');
    
    // Test with spaces
    issue.set('dependencies', '1, 2, 3');
    assert.deepEqual(issue.dependencyIds, ['1', '2', '3'], 'Should handle spaces around commas');
    
    // Test with empty string
    issue.set('dependencies', '');
    assert.deepEqual(issue.dependencyIds, [], 'Should return empty array for empty string');
    
    // Test with null
    issue.set('dependencies', null);
    assert.deepEqual(issue.dependencyIds, [], 'Should return empty array for null');
    
    // Test with single ID
    issue.set('dependencies', '42');
    assert.deepEqual(issue.dependencyIds, ['42'], 'Should handle single ID');
  });

  test('isOverdue calculation works correctly', function(assert) {
    let store = this.owner.lookup('service:store');
    let issue = store.createRecord('issue', {});
    
    // Mock issue status for incomplete task
    let inProgressStatus = store.createRecord('issuestatus', {
      name: 'in-progress',
      done: '0'
    });
    
    let doneStatus = store.createRecord('issuestatus', {
      name: 'done',
      done: '1'
    });
    
    // Test overdue incomplete task
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    issue.setProperties({
      endDate: yesterday.toISOString().split('T')[0],
      issuestatus: inProgressStatus
    });
    
    assert.true(issue.isOverdue, 'Incomplete task past end date should be overdue');
    
    // Test completed overdue task
    issue.set('issuestatus', doneStatus);
    assert.false(issue.isOverdue, 'Completed task should not be overdue even if past end date');
    
    // Test future end date
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    issue.setProperties({
      endDate: tomorrow.toISOString().split('T')[0],
      issuestatus: inProgressStatus
    });
    
    assert.false(issue.isOverdue, 'Task with future end date should not be overdue');
    
    // Test no end date
    issue.set('endDate', null);
    assert.false(issue.isOverdue, 'Task with no end date should not be overdue');
  });

  test('cssClass generation works correctly', function(assert) {
    let store = this.owner.lookup('service:store');
    
    // Mock issue status
    let inProgressStatus = store.createRecord('issuestatus', {
      name: 'in-progress'
    });
    
    let issue = store.createRecord('issue', {
      priority: 'high',
      issuestatus: inProgressStatus
    });
    
    let cssClass = issue.cssClass;
    
    assert.true(cssClass.includes('gantt-task'), 'Should include base gantt-task class');
    assert.true(cssClass.includes('priority-high'), 'Should include priority class');
    assert.true(cssClass.includes('status-in-progress'), 'Should include status class');
    
    // Test overdue class
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    issue.set('endDate', yesterday.toISOString().split('T')[0]);
    
    cssClass = issue.cssClass;
    assert.true(cssClass.includes('overdue'), 'Should include overdue class for overdue tasks');
  });
});
