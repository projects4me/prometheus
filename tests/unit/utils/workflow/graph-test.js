import { module, test } from 'qunit';
import WorkflowGraph from 'prometheus/utils/workflow/graph';
import { portsOf, kindLabelKey, kindsOf } from 'prometheus/utils/workflow/node-catalog';
import Viewport from 'prometheus/utils/workflow/viewport';
import { bounds, inputPoint, nodeHeight, outputPoint } from 'prometheus/utils/workflow/node-geometry';

module('Unit | Utility | workflow graph', function () {
  test('a switch offers its cases before its default port', function (assert) {
    assert.deepEqual(portsOf('condition', 'switch', { cases: [{ key: 'bug' }, { key: 'task' }, { key: 'bug' }] }), ['bug', 'task', 'default']);
    assert.deepEqual(portsOf('actor', 'run_agent', {}), ['done', 'needs_input', 'blocked', 'failed', 'limit']);
    assert.deepEqual(portsOf('action', 'end', {}), []);
    assert.ok(kindsOf('trigger').includes('issue.assignee.changed'));
    assert.strictEqual(kindLabelKey('issue.assignee.changed'), 'views.app.workflow.kinds.issue_assignee_changed');
  });

  test('builds the graph of saved records and reads their config', function (assert) {
    let nodes = [
      { id: '1', category: 'trigger', kind: 'issue.created', config: '{}', name: 'Start', positionX: 10, positionY: 20 },
      { id: '2', category: 'condition', kind: 'switch', config: '{"cases":[{"key":"bug"}]}', positionX: 300, positionY: 20 },
      { id: '3', category: 'action', kind: 'end', config: 'not json' }
    ];
    let edges = [
      { id: '9', fromNodeId: '1', fromPort: 'next', toNodeId: '2' },
      { id: '10', fromNodeId: '2', fromPort: 'bug', toNodeId: '404' }
    ];
    let graph = WorkflowGraph.fromRecords(nodes, edges);
    assert.strictEqual(graph.nodes.length, 3);
    assert.deepEqual(graph.nodes[1].ports, ['bug', 'default']);
    assert.deepEqual(graph.nodes[2].config, {});
    assert.strictEqual(graph.edges.length, 1, 'an edge to a missing node is left out');
    assert.strictEqual(graph.edges[0].to, graph.nodes[1]);
  });

  test('connects a port to one node and refuses edges that cannot be drawn', function (assert) {
    let graph = new WorkflowGraph();
    let trigger = graph.addNode('trigger', 'issue.created', 0, 0);
    let filter = graph.addNode('condition', 'filter', 300, 0);
    let end = graph.addNode('action', 'end', 600, 0);

    assert.ok(graph.connect(trigger, 'next', filter));
    assert.notOk(graph.connect(filter, 'pass', trigger), 'a trigger has no input');
    assert.notOk(graph.connect(filter, 'pass', filter), 'no edge to itself');
    assert.notOk(graph.connect(filter, 'nope', end), 'only the kind\'s ports');

    graph.connect(trigger, 'next', end);
    assert.strictEqual(graph.edges.length, 1, 'a port leads to one node');
    assert.strictEqual(graph.edgeFrom(trigger, 'next').to, end);
  });

  test('removing a saved node removes its edges and queues their records', function (assert) {
    let graph = WorkflowGraph.fromRecords(
      [{ id: '1', category: 'trigger', kind: 'issue.created' }, { id: '2', category: 'action', kind: 'end' }],
      [{ id: '5', fromNodeId: '1', fromPort: 'next', toNodeId: '2' }]
    );
    graph.removeNode(graph.nodes[1]);
    assert.strictEqual(graph.nodes.length, 1);
    assert.strictEqual(graph.edges.length, 0);
    assert.deepEqual(graph.removedRecords.map(record => record.id), ['5', '2']);
  });

  test('the viewport zooms around a point, fits a box and maps screen points', function (assert) {
    let viewport = new Viewport();
    viewport.zoomBy(2, 100, 100);
    assert.strictEqual(viewport.scale, 2);
    assert.deepEqual(viewport.toCanvas(100, 100), { x: 100, y: 100 }, 'the point under the cursor stays');
    viewport.zoomBy(100);
    assert.strictEqual(viewport.scale, Viewport.MAX_SCALE);

    viewport.fit({ minX: 0, minY: 0, maxX: 2000, maxY: 400 }, 1080, 600, 40);
    assert.strictEqual(viewport.scale, 0.5);
    assert.deepEqual(viewport.toCanvas(40, 200), { x: 0, y: 0 });
  });

  test('the ports sit inside the node', function (assert) {
    let node = { x: 0, y: 0, ports: ['pass', 'fail'] };
    let height = nodeHeight(node.ports.length);
    assert.ok(inputPoint(node).y < outputPoint(node, 0).y);
    assert.ok(outputPoint(node, 1).y < height);
    assert.deepEqual(bounds([node]), { minX: 0, minY: 0, maxX: 200, maxY: height });
    assert.strictEqual(bounds([]), null);
  });
});
