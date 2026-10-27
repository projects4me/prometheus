import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | field-info', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    localStorage.removeItem('field-info-hidden');
  });

  hooks.afterEach(function () {
    localStorage.removeItem('field-info-hidden');
  });

  test('bubbles start visible', function (assert) {
    let service = this.owner.lookup('service:field-info');
    assert.false(service.isHidden('a'));
  });

  test('toggle hides and shows a bubble and saves it', function (assert) {
    let service = this.owner.lookup('service:field-info');

    service.toggle('a');
    assert.true(service.isHidden('a'));
    assert.false(service.isHidden('b'), 'other keys are unaffected');
    assert.deepEqual(JSON.parse(localStorage.getItem('field-info-hidden')), ['a']);

    service.toggle('a');
    assert.false(service.isHidden('a'));
    assert.deepEqual(JSON.parse(localStorage.getItem('field-info-hidden')), []);
  });

  test('hidden keys are restored from localStorage', function (assert) {
    localStorage.setItem('field-info-hidden', JSON.stringify(['a']));
    let service = this.owner.lookup('service:field-info');
    assert.true(service.isHidden('a'));
  });

  test('toggle works when localStorage is unavailable', function (assert) {
    let service = this.owner.lookup('service:field-info');
    let original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('denied'); };
    try {
      service.toggle('a');
      assert.true(service.isHidden('a'));
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
