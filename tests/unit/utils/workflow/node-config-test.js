import { module, test } from 'qunit';
import WorkflowGraph from 'prometheus/utils/workflow/graph';
import { actorPaths, buildConfig, configFields, isExpression, triggerFields } from 'prometheus/utils/workflow/node-config';

module('Unit | Utility | workflow node config', function () {
  test('lists the settings of each kind', function (assert) {
    assert.deepEqual(configFields('actor', 'ask_user').map(field => field.name), ['userId', 'question']);
    assert.deepEqual(configFields('trigger', 'schedule'), [{ name: 'cron', type: 'cron', required: true }]);
    assert.deepEqual(configFields('trigger', 'issue.created'), [], 'trigger events take no settings');
    assert.deepEqual(configFields('action', 'end'), []);
  });

  test('builds the config Gaia takes from a draft', function (assert) {
    assert.deepEqual(
      buildConfig('actor', 'run_agent', { agentId: '7', prompt: '  Fix {issue.subject} ', session: '', model: null, stray: 'x' }),
      { agentId: '7', prompt: 'Fix {issue.subject}' },
      'unset settings and settings the kind does not take are left out'
    );
    assert.deepEqual(
      buildConfig('condition', 'filter', { conditions: [
        { field: 'issue.status', operator: 'equals', value: 'Done' },
        { field: 'issue.assignee', operator: 'empty', value: 'ignored' }
      ] }),
      { conditions: [
        { field: 'issue.status', operator: 'equals', value: 'Done' },
        { field: 'issue.assignee', operator: 'empty' }
      ] },
      'operators that take no value drop it'
    );
    assert.deepEqual(
      buildConfig('condition', 'switch', { cases: [{ key: ' bug ', conditions: [{ field: 'issue.typeId', operator: 'equals', value: '1' }] }] }),
      { cases: [{ key: 'bug', conditions: [{ field: 'issue.typeId', operator: 'equals', value: '1' }] }] }
    );
    assert.deepEqual(buildConfig('condition', 'filter', { conditions: [] }), {}, 'an empty list is unset');
  });

  test('tells expressions from ids', function (assert) {
    assert.true(isExpression('{issue.assignee}'));
    assert.true(isExpression(' {role:Developer} '));
    assert.false(isExpression('42'));
    assert.false(isExpression('Fix {issue.subject}'));
  });

  test('offers the payload paths of the graph\'s triggers once each', function (assert) {
    let nodes = [
      { category: 'trigger', kind: 'issue.created' },
      { category: 'trigger', kind: 'issue.status.changed' },
      { category: 'action', kind: 'end' }
    ];
    let events = [
      { name: 'issue.created', fields: [{ path: 'projectId', type: 'string' }, { path: 'issue.subject', type: 'string' }] },
      { name: 'issue.status.changed', fields: [{ path: 'projectId', type: 'string' }, { path: 'changes.status.after', type: 'string' }] },
      { name: 'comment.added', fields: [{ path: 'comment.id', type: 'string' }] }
    ];
    assert.deepEqual(triggerFields(nodes, events).map(field => field.path), ['projectId', 'issue.subject', 'changes.status.after']);
    assert.deepEqual(triggerFields([{ category: 'action', kind: 'end' }], events), [], 'no trigger, no paths');
  });

  test('applying a switch without a case drops the connection from its port', function (assert) {
    let graph = new WorkflowGraph();
    let choice = graph.addNode('condition', 'switch', 0, 0);
    let end = graph.addNode('action', 'end', 0, 100);
    graph.updateNode(choice, 'Pick', { cases: [{ key: 'bug', conditions: [] }] });
    graph.connect(choice, 'bug', end);
    graph.connect(choice, 'default', end);
    assert.strictEqual(graph.edges.length, 2);

    graph.updateNode(choice, 'Pick', { cases: [] });
    assert.strictEqual(choice.name, 'Pick');
    assert.deepEqual(graph.edges.map(edge => edge.port), ['default']);
  });

  test('lists the payload paths that may name a user or an agent', function (assert) {
    assert.deepEqual(
      actorPaths([
        { path: 'issue.assignee', type: 'string' },
        { path: 'issue.subject', type: 'string' },
        { path: 'actor.id', type: 'string' },
        { path: 'issue.reportedUser', type: 'string' },
        { path: 'issue.projectId', type: 'string' },
        { path: 'issue.status', type: 'string' }
      ]),
      ['issue.assignee', 'actor.id', 'issue.reportedUser', 'issue.projectId']
    );
    assert.deepEqual(actorPaths(), []);
  });
});
