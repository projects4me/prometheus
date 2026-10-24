import { module, test } from 'qunit';
import decodePlanBody from 'prometheus/utils/idea-plan-body';

module('Unit | Utility | idea-plan-body', function () {
  test('drops invalid issue entries from a JSON string body', function (assert) {
    let body = decodePlanBody(JSON.stringify({ summary: 's', issues: [null, { key: 'A-1' }, 'x', 3] }));
    assert.deepEqual(body, { summary: 's', issues: [{ key: 'A-1' }] });
  });

  test('drops invalid issue entries from an object body', function (assert) {
    assert.deepEqual(decodePlanBody({ issues: [null] }).issues, []);
  });

  test('keeps bodies without issues unchanged', function (assert) {
    assert.deepEqual(decodePlanBody('plain'), { summary: 'plain' });
    assert.deepEqual(decodePlanBody(null), {});
  });
});
