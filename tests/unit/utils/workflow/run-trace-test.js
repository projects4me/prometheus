import { module, test } from 'qunit';
import RunTrace, { normalizeSteps, parseJson } from 'prometheus/utils/workflow/run-trace';

module('Unit | Utility | workflow/run-trace', function () {
    test('parseJson reads text and objects and tolerates garbage', function (assert) {
        assert.deepEqual(parseJson('{"a":1}'), { a: 1 });
        assert.deepEqual(parseJson({ a: 1 }), { a: 1 });
        assert.deepEqual(parseJson('nope'), {});
        assert.deepEqual(parseJson(null), {});
    });

    test('normalizeSteps orders by sequence and pretty-prints inputs', function (assert) {
        let steps = normalizeSteps([
            { sequence: 2, nodeId: 8, inputs: '{}', outputs: {} },
            { sequence: 1, nodeId: 7, inputs: '{"x":1}', port: 'next' }
        ]);
        assert.deepEqual(steps.map(step => step.nodeId), ['7', '8']);
        assert.deepEqual(steps[0].inputs, { x: 1 });
        assert.strictEqual(steps[0].port, 'next');
    });

    test('a trace finds the steps of nodes and the edges taken', function (assert) {
        let trace = new RunTrace(normalizeSteps([
            { sequence: 1, nodeId: 1, port: 'pass' },
            { sequence: 2, nodeId: 2, port: 'next' }
        ]));
        let a = { record: { id: 1 } };
        let b = { record: { id: 2 } };
        let c = { record: { id: 3 } };
        assert.ok(trace.stepOf(a));
        assert.notOk(trace.stepOf(c));
        assert.notOk(trace.stepOf({ record: null }));
        assert.ok(trace.tookEdge({ from: a, port: 'pass', to: b }));
        assert.notOk(trace.tookEdge({ from: a, port: 'fail', to: b }));
        assert.notOk(trace.tookEdge({ from: b, port: 'next', to: c }));
    });

    test('a node the run came back to keeps every edge taken from it', function (assert) {
        let trace = new RunTrace(normalizeSteps([
            { sequence: 1, nodeId: 1, port: 'again' },
            { sequence: 2, nodeId: 2, port: 'next' },
            { sequence: 3, nodeId: 1, port: 'done' },
            { sequence: 4, nodeId: 3, port: null }
        ]));
        let a = { record: { id: 1 } };
        let b = { record: { id: 2 } };
        let c = { record: { id: 3 } };
        assert.ok(trace.tookEdge({ from: a, port: 'again', to: b }));
        assert.ok(trace.tookEdge({ from: a, port: 'done', to: c }));
        assert.equal(trace.stepsOf(a).length, 2);
    });
});
