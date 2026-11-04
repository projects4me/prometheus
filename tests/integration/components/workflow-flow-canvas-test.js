/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | workflow/flow-canvas', function (hooks) {
    setupRenderingTest(hooks);

    /**
     * Dispatches a cancelable wheel event over the canvas and reports whether it was prevented
     */
    async function wheel(options) {
        let event = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true, ...options });
        document.querySelector('[data-canvas-viewport]').dispatchEvent(event);
        await triggerEvent('[data-canvas-viewport]', 'pointermove');
        return event.defaultPrevented;
    }

    test('a plain wheel scrolls the page and does not zoom', async function (assert) {
        this.set('graph', { nodes: [], edges: [] });
        await render(hbs`<Workflow::FlowCanvas @graph={{this.graph}} />`);
        let before = document.querySelector('[data-zoom-level]').textContent.trim();

        assert.false(await wheel({}), 'default not prevented');
        assert.dom('[data-zoom-level]').hasText(before, 'zoom unchanged');
    });

    test('Ctrl, ⌘ and pinch (ctrlKey) wheel zoom', async function (assert) {
        this.set('graph', { nodes: [], edges: [] });
        await render(hbs`<Workflow::FlowCanvas @graph={{this.graph}} />`);
        let level = () => document.querySelector('[data-zoom-level]').textContent.trim();

        let before = level();
        assert.true(await wheel({ ctrlKey: true }), 'Ctrl prevents the default');
        let afterCtrl = level();
        assert.notEqual(afterCtrl, before, 'Ctrl + wheel zooms');

        assert.true(await wheel({ metaKey: true }), '⌘ prevents the default');
        assert.notEqual(level(), afterCtrl, '⌘ + wheel zooms');
    });
});
