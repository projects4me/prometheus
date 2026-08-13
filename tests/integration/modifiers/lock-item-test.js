/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | lock-item', function (hooks) {
    setupRenderingTest(hooks);

    test('lock item modifier', async function (assert) {
        await render(hbs`
            <div class="item">
                <div class="overlay" {{lock-item}}> </div>
             </div>
      `);

        let el = document.querySelector('div.item');
        assert.equal(el.style.pointerEvents, "none");
    });

    test('restores parent pointer-events when overlay is removed', async function (assert) {
        this.set('isLocked', true);

        await render(hbs`
            <div class="item">
                {{#if this.isLocked}}
                    <div class="overlay" {{lock-item}}></div>
                {{/if}}
            </div>
        `);

        let el = document.querySelector('div.item');
        assert.equal(el.style.pointerEvents, "none", "parent is locked while overlay is present");

        this.set('isLocked', false);
        await settled();

        assert.equal(el.style.pointerEvents, "", "parent pointer-events restored after overlay is removed");
    });
});
