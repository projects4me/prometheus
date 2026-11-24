/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import Sortable from 'sortablejs';
import InitializeSortable from 'prometheus/modifiers/initialize-sortable';

/**
 * Reads a getter of the modifier against a stand-in instance, so no Ember owner is needed.
 *
 * @method read
 * @param {String} name
 * @param {Object} fake
 * @return {*}
 */
function read(name, fake) {
    return Object.getOwnPropertyDescriptor(InitializeSortable.prototype, name).get.call(fake);
}

module('Unit | Modifier | initialize-sortable', function () {
    test('Sortable is disabled on phones', function (assert) {
        let fake = { phoneQuery: { matches: true }, named: {} };
        fake.isPhone = read('isPhone', fake);
        assert.true(read('disableSortable', fake));
    });

    test('Sortable stays enabled on desktop', function (assert) {
        let fake = { phoneQuery: { matches: false }, named: {} };
        fake.isPhone = read('isPhone', fake);
        assert.false(read('disableSortable', fake));
    });

    test('the disableSortable argument still disables it on desktop', function (assert) {
        let fake = { phoneQuery: { matches: false }, named: { disableSortable: true } };
        fake.isPhone = read('isPhone', fake);
        assert.true(read('disableSortable', fake));
    });

    test('crossing the breakpoint updates the Sortable disabled option', function (assert) {
        let lane = document.createElement('div');
        lane.className = 'lane box-body';
        document.body.appendChild(lane);
        let sortable = new Sortable(lane, { disabled: false });
        let fake = { phoneQuery: { matches: true }, named: {} };
        fake.isPhone = true;
        Object.defineProperty(fake, 'disableSortable', { get: () => read('disableSortable', fake) });
        InitializeSortable.prototype._applyDisabled.call(fake);
        assert.true(sortable.option('disabled'), 'disabled below the breakpoint');
        fake.phoneQuery.matches = false;
        fake.isPhone = false;
        InitializeSortable.prototype._applyDisabled.call(fake);
        assert.false(sortable.option('disabled'), 'enabled again on desktop');
        sortable.destroy();
        lane.remove();
    });

    test('a drop on a collapsed lane saves the lane status through updateIssue and keeps the lane collapsed', function (assert) {
        let laneBody = document.createElement('div');
        let lane = document.createElement('div');
        lane.className = 'lane lane-collapsed';
        lane.appendChild(laneBody);
        laneBody.className = 'lane box-body';
        let calls = [];
        let item = document.createElement('div');
        let from = document.createElement('div');
        let fake = { updateIssue: (...args) => calls.push(args) };
        InitializeSortable.prototype._handleCollapsedLaneDrop.call(fake, { to: lane, from, item });
        assert.strictEqual(calls.length, 1);
        assert.strictEqual(calls[0][1], laneBody);
        assert.true(lane.classList.contains('lane-collapsed'));
        assert.true(lane.classList.contains('lane-dropped'));
    });
});
