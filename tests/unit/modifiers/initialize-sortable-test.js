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

    test('drag start starts the lane peek', function (assert) {
        let from = document.createElement('div');
        let started = 0;
        let fake = {
            selectDropzones: () => {},
            lanePeek: { start: () => started++ }
        };
        InitializeSortable.prototype._onStart.call(fake, { from });
        assert.strictEqual(started, 1);
    });

    test('a drop in a peeked lane card area saves its status and the lane collapses again', function (assert) {
        let lane = document.createElement('div');
        lane.className = 'lane lane-collapsed lane-peek';
        let laneBody = document.createElement('div');
        laneBody.className = 'lane box-body';
        lane.appendChild(laneBody);
        let fromLane = document.createElement('div');
        let from = document.createElement('div');
        from.className = 'lane box-body';
        fromLane.appendChild(from);
        let item = document.createElement('div');
        laneBody.appendChild(item);
        let calls = [];
        let stopped = 0;
        let fake = {
            updateIssue: (...args) => calls.push(args),
            unSelectDropzones: () => {},
            lanePeek: {
                stop: () => {
                    stopped++;
                    lane.classList.remove('lane-peek');
                }
            }
        };
        InitializeSortable.prototype._onEnd.call(fake, { to: laneBody, from, item });
        assert.deepEqual(calls, [[item, laneBody, from]], 'saved through updateIssue with the lane card area');
        assert.strictEqual(stopped, 1, 'the peek stops on drag end');
        assert.false(lane.classList.contains('lane-peek'));
        assert.true(lane.classList.contains('lane-collapsed'), 'the lane is collapsed again');
    });

    test('drag end stops the lane peek even when the card is put back', function (assert) {
        let from = document.createElement('div');
        let stopped = 0;
        let fake = { unSelectDropzones: () => {}, lanePeek: { stop: () => stopped++ } };
        InitializeSortable.prototype._onEnd.call(fake, { to: from, from, item: document.createElement('div') });
        assert.strictEqual(stopped, 1);
    });

    test('collapsed lanes keep their card area Sortable for the peek drop', function (assert) {
        let board = document.createElement('div');
        board.innerHTML = '<div class="lane lane-collapsed"><div class="lane box-body"></div></div>';
        document.body.appendChild(board);
        let fake = {
            element: board,
            getSortableOptions: () => ({}),
            _setupMilestoneTabsAsSortable: () => {}
        };
        InitializeSortable.prototype._attachSortableToLanes.call(fake);
        let body = board.querySelector('.lane.box-body');
        assert.ok(Sortable.get(body), 'the hidden card area has its Sortable');
        Sortable.get(body).destroy();
        board.remove();
    });

    test('every milestone tab but the open one is a drop target, and the drop zones follow the open tab', function (assert) {
        let board = document.createElement('div');
        board.innerHTML = ['backlog', '5', '6'].map((id) =>
            `<li data-milestone-tab data-milestone-id="${id}"><a></a><div class="drop-zone-area"></div></li>`).join('');
        document.body.appendChild(board);
        let fake = { element: board, named: { activeMilestoneId: '5' } };
        Object.defineProperty(fake, 'activeMilestoneId', { get: () => read('activeMilestoneId', fake) });
        fake._isActiveTab = InitializeSortable.prototype._isActiveTab;
        let zone = (id) => board.querySelector(`[data-milestone-id="${id}"] .drop-zone-area`);

        InitializeSortable.prototype._setupMilestoneTabsAsSortable.call(fake);
        assert.notOk(zone('5').sortable, 'the open tab is not a drop target');
        assert.ok(zone('backlog').sortable, 'the backlog tab is a drop target');
        assert.ok(zone('6').sortable, 'the other milestone tab is one');

        fake.named = { activeMilestoneId: 'backlog' };
        InitializeSortable.prototype._setupMilestoneTabsAsSortable.call(fake);
        assert.notOk(zone('backlog').sortable, 'the newly open tab stops being a drop target');
        assert.ok(zone('5').sortable, 'the previously open tab becomes one');

        ['backlog', '5', '6'].forEach((id) => zone(id).sortable?.destroy());
        board.remove();
    });
});
