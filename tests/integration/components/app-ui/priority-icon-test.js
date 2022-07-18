/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/priority-icon', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {

        let priorties = [
            ["blocker", "fa-ban"],
            ["critical", "fa-angle-double-up"],
            ["high", "fa-arrow-up"],
            ["medium", "fa-dot-circle-o"],
            ["low", "fa-arrow-down"],
            ["lowest", "fa-angle-double-down"]
        ];

        for (let i = 0; i < priorties.length; i++) {
            this.set('priority', priorties[i][0]);

            await render(hbs`
                <AppUi::PriorityIcon 
                    @priority={{this.priority}}
                />
            `);

            assert.dom('i').hasClass(`${priorties[i][1]}`);
        }

    });
});
