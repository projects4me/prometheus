/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { buildElbowPath, STUB, START_GAP, END_GAP } from 'prometheus/utils/gantt/elbow-path';
import { GANTT_ROW_HEIGHT } from 'prometheus/utils/gantt-helpers';

module('Unit | Utility | gantt/elbow-path', function () {
    const ROW = 45;
    const SX = (x) => x + START_GAP;
    const EX = (x) => x - END_GAP;

    test('the gap defaults to half of GANTT_ROW_HEIGHT', function (assert) {
        const path = buildElbowPath({ x: 200, y: 20 }, { x: 100, y: 65 });
        assert.strictEqual(path, `M ${SX(200)} 20 H ${SX(200) + STUB} V ${20 + GANTT_ROW_HEIGHT / 2} H ${EX(100) - STUB} V 65 H ${EX(100)}`);
    });

    test('forward link steps down at the stub and enters the dependent from the left', function (assert) {
        const path = buildElbowPath({ x: 100, y: 20 }, { x: 200, y: 65 }, ROW);
        assert.strictEqual(path, `M ${SX(100)} 20 H ${SX(100) + STUB} V 65 H ${EX(200)}`);
    });

    test('backward link routes through the gap below towards a lower row', function (assert) {
        const path = buildElbowPath({ x: 200, y: 20 }, { x: 100, y: 65 }, ROW);
        assert.strictEqual(path, `M ${SX(200)} 20 H ${SX(200) + STUB} V 42.5 H ${EX(100) - STUB} V 65 H ${EX(100)}`);
    });

    test('backward link towards a higher row routes through the gap above', function (assert) {
        const path = buildElbowPath({ x: 200, y: 65 }, { x: 100, y: 20 }, ROW);
        assert.strictEqual(path, `M ${SX(200)} 65 H ${SX(200) + STUB} V 42.5 H ${EX(100) - STUB} V 20 H ${EX(100)}`);
    });

    test('same row goes below the row', function (assert) {
        const path = buildElbowPath({ x: 200, y: 20 }, { x: 100, y: 20 }, ROW);
        assert.strictEqual(path, `M ${SX(200)} 20 H ${SX(200) + STUB} V 42.5 H ${EX(100) - STUB} V 20 H ${EX(100)}`);
    });

    test('tight gap (less than two stubs) uses the backward route', function (assert) {
        const path = buildElbowPath({ x: 100, y: 20 }, { x: 100 + START_GAP + END_GAP + 2 * STUB - 1, y: 65 }, ROW);
        assert.ok(path.includes('V 42.5'), 'goes through the row gap');
        const exact = buildElbowPath({ x: 100, y: 20 }, { x: 100 + START_GAP + END_GAP + 2 * STUB, y: 65 }, ROW);
        assert.strictEqual(exact, `M ${SX(100)} 20 H ${SX(100) + STUB} V 65 H ${100 + START_GAP + 2 * STUB}`);
    });

    test('siblings of one issue share the same trunk x', function (assert) {
        const start = { x: 100, y: 20 };
        const a = buildElbowPath(start, { x: 300, y: 65 }, ROW);
        const b = buildElbowPath(start, { x: 400, y: 110 }, ROW);
        assert.ok(a.startsWith(`M ${SX(100)} 20 H ${SX(100) + STUB} V`));
        assert.ok(b.startsWith(`M ${SX(100)} 20 H ${SX(100) + STUB} V`));
    });

    test('an offset shifts the vertical run so a second link between the pair stays visible', function (assert) {
        const start = { x: 100, y: 20 };
        const end = { x: 300, y: 65 };
        assert.notStrictEqual(buildElbowPath(start, end, ROW, 5), buildElbowPath(start, end, ROW));
        assert.strictEqual(buildElbowPath(start, end, ROW, 5), `M ${SX(100)} 20 H ${SX(100) + STUB + 5} V 65 H ${EX(300)}`);
        assert.ok(buildElbowPath({ x: 200, y: 20 }, { x: 100, y: 65 }, ROW, 5).includes('V 47.5'));
    });

    test('contains only horizontal and vertical segments', function (assert) {
        const path = buildElbowPath({ x: 200, y: 20 }, { x: 100, y: 65 }, ROW);
        assert.notOk(/[CLQSA]/.test(path));
    });

    test('returns an empty string without points', function (assert) {
        assert.strictEqual(buildElbowPath(null, { x: 1, y: 1 }, ROW), '');
    });
});
