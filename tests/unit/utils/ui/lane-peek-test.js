/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import LanePeek, { PEEK_CLASS, PEEK_DELAY } from 'prometheus/utils/ui/lane-peek';

const DELAY = 20;

/**
 * Waits long enough for a pending peek to open.
 *
 * @method wait
 * @param {Number} ms
 * @return {Promise}
 */
function wait(ms = DELAY * 3) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * A collapsed lane with a title, attached to the document, whose box is the given rectangle.
 *
 * @method collapsedLane
 * @param {Object} rect
 * @return {HTMLElement}
 */
function collapsedLane(rect) {
    let lane = document.createElement('div');
    lane.className = 'lane lane-collapsed';
    lane.innerHTML = '<div class="lane-title">Open</div><div class="lane box-body"></div>';
    lane.getBoundingClientRect = () => rect;
    document.body.appendChild(lane);
    return lane;
}

/**
 * A stand-in document: elementFromPoint returns what `at` maps the point to, and listeners are recorded.
 *
 * @method fakeDocument
 * @param {Function} at
 * @return {Object}
 */
function fakeDocument(at) {
    let listeners = new Map();
    return {
        listeners,
        elementFromPoint: (x, y) => at(x, y),
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: (name) => listeners.delete(name),
        move(x, y) {
            let fn = listeners.get('pointermove');
            fn && fn({ clientX: x, clientY: y });
        }
    };
}

module('Unit | Utility | ui/lane-peek', function (hooks) {
    let lane;
    let other;

    hooks.beforeEach(function () {
        lane = collapsedLane({ left: 0, right: 45, top: 0, bottom: 500 });
        other = document.createElement('div');
        document.body.appendChild(other);
    });

    hooks.afterEach(function () {
        lane.remove();
        other.remove();
    });

    test('it waits about 300ms by default', function (assert) {
        assert.strictEqual(PEEK_DELAY, 300);
    });

    test('a collapsed lane held under the pointer opens after the delay', async function (assert) {
        let doc = fakeDocument((x) => (x <= 45 ? lane.querySelector('.lane-title') : other));
        let peek = new LanePeek({ document: doc, delay: DELAY });
        peek.start();
        doc.move(10, 10);
        assert.false(lane.classList.contains(PEEK_CLASS), 'not open straight away');
        await wait();
        assert.true(lane.classList.contains(PEEK_CLASS), 'open after the delay');
        assert.true(lane.classList.contains('lane-collapsed'), 'the collapsed state is untouched');
        peek.stop();
    });

    test('passing quickly over a collapsed lane does not open it', async function (assert) {
        let doc = fakeDocument((x) => (x <= 45 ? lane : other));
        let peek = new LanePeek({ document: doc, delay: DELAY });
        peek.start();
        doc.move(10, 10);
        doc.move(100, 10);
        await wait();
        assert.false(lane.classList.contains(PEEK_CLASS));
        peek.stop();
    });

    test('a peeked lane collapses again when the pointer leaves its full-width box', async function (assert) {
        let doc = fakeDocument((x) => (x <= 220 ? lane : other));
        let peek = new LanePeek({ document: doc, delay: DELAY });
        peek.start();
        doc.move(10, 10);
        await wait();
        lane.getBoundingClientRect = () => ({ left: 0, right: 220, top: 0, bottom: 500 });
        doc.move(150, 10);
        assert.true(lane.classList.contains(PEEK_CLASS), 'stays open inside its full-width box');
        doc.move(300, 10);
        assert.false(lane.classList.contains(PEEK_CLASS), 'collapses once the pointer leaves');
        peek.stop();
    });

    test('drag end collapses every peeked lane and removes the listener and timer', async function (assert) {
        let doc = fakeDocument(() => lane);
        let peek = new LanePeek({ document: doc, delay: DELAY });
        peek.start();
        assert.true(doc.listeners.has('pointermove'), 'tracks the pointer during the drag');
        doc.move(10, 10);
        await wait();
        assert.true(lane.classList.contains(PEEK_CLASS));
        peek.stop();
        assert.false(lane.classList.contains(PEEK_CLASS), 'collapsed on drag end');
        assert.false(doc.listeners.has('pointermove'), 'listener removed');
    });

    test('drag end before the delay cancels the pending peek', async function (assert) {
        let doc = fakeDocument(() => lane);
        let peek = new LanePeek({ document: doc, delay: DELAY });
        peek.start();
        doc.move(10, 10);
        peek.stop();
        await wait();
        assert.false(lane.classList.contains(PEEK_CLASS));
    });

    test('open lanes and points outside any lane are ignored', async function (assert) {
        lane.classList.remove('lane-collapsed');
        let doc = fakeDocument((x) => (x <= 45 ? lane : null));
        let peek = new LanePeek({ document: doc, delay: DELAY });
        peek.start();
        doc.move(10, 10);
        doc.move(500, 10);
        await wait();
        assert.false(lane.classList.contains(PEEK_CLASS));
        peek.stop();
    });
});
