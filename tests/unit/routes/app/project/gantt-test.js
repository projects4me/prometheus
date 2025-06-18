import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | app/project/gantt', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:app/project/gantt');
    assert.ok(route);
  });
});
