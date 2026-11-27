/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | tooltip', function (hooks) {
    setupRenderingTest(hooks);

    function host() {
        return document.querySelector('[data-test-tooltip-host]');
    }

    test('it shows the text as plain text in the p4m theme, above the element', async function (assert) {
        this.set('text', '<b>Add</b> issue');
        await render(hbs`<button type="button" data-test-tooltip-host {{tooltip this.text}}>+</button>`);

        const instance = host()._tippy;
        assert.ok(instance, 'a tippy instance is created');
        assert.strictEqual(instance.props.placement, 'top', 'placement defaults to top');
        assert.strictEqual(instance.props.theme, 'p4m', 'it uses the p4m theme');
        assert.false(instance.props.allowHTML, 'HTML is not allowed');

        instance.show();
        const content = instance.popper.querySelector('.tippy-content');
        assert.strictEqual(content.textContent, '<b>Add</b> issue', 'the text is shown as is');
        assert.notOk(content.querySelector('b'), 'the text is not read as HTML');
        assert.ok(instance.popper.querySelector('.tippy-box[data-theme="p4m"]'), 'the box has the p4m theme');
        instance.hide();
    });

    test('it takes the placement argument', async function (assert) {
        await render(
            hbs`<span data-test-tooltip-host {{tooltip "Below" placement="bottom"}}>x</span>`
        );

        assert.strictEqual(host()._tippy.props.placement, 'bottom');
    });

    test('it updates the text when it changes', async function (assert) {
        this.set('text', 'First');
        await render(hbs`<span data-test-tooltip-host {{tooltip this.text}}>x</span>`);
        const instance = host()._tippy;

        this.set('text', 'Second');
        await settled();

        assert.strictEqual(host()._tippy, instance, 'the same instance is kept');
        assert.strictEqual(instance.props.content, 'Second', 'the text is updated');
    });

    test('an empty text shows no tooltip', async function (assert) {
        this.set('text', '');
        await render(hbs`<span data-test-tooltip-host {{tooltip this.text}}>x</span>`);
        assert.notOk(host()._tippy, 'no tooltip for an empty text');

        this.set('text', 'Now set');
        await settled();
        assert.strictEqual(host()._tippy.props.content, 'Now set', 'a tooltip once the text is set');

        this.set('text', null);
        await settled();
        assert.notOk(host()._tippy, 'the tooltip is removed when the text becomes empty');
    });

    test('it destroys the tooltip on teardown', async function (assert) {
        this.set('show', true);
        await render(
            hbs`{{#if this.show}}<span data-test-tooltip-host {{tooltip "Bye"}}>x</span>{{/if}}`
        );
        const element = host();
        const instance = element._tippy;
        instance.show();

        this.set('show', false);
        await settled();

        assert.true(instance.state.isDestroyed, 'the instance is destroyed');
        assert.notOk(element._tippy, 'the element no longer has a tooltip');
    });
});
