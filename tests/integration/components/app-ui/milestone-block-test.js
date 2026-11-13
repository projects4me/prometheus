/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/milestone-block', function (hooks) {
    setupRenderingTest(hooks);

    const blocks = {
        closed: 'fa-times',
        complete: null,
        completed: null,
        deferred: null,
        failed: null,
        overdue: null
    };

    for (const status of Object.keys(blocks)) {
        test(`it renders the ${status} block`, async function (assert) {
            this.set('milestone', { id: 1, name: 'M', status, startDate: '2022-01-01', endDate: '2099-01-01', issues: [] });
            await render(hbs`<AppUi::MilestoneBlock @milestone={{this.milestone}} />`);
            assert.dom('[data-milestone-id="1"]').exists();
            assert.dom('[data-milestone-status]').hasAttribute('data-milestone-status', status);
            // index block uses bg-yellow; every status block has its own colour
            assert.dom('[data-milestone-id="1"]').doesNotHaveClass('bg-yellow');
        });
    }

    test('it renders the index block for an unknown status', async function (assert) {
        this.set('milestone', { id: 2, name: 'M', status: 'unknown_status', startDate: '2022-01-01', endDate: '2099-01-01', issues: [] });
        await render(hbs`<AppUi::MilestoneBlock @milestone={{this.milestone}} />`);
        assert.dom('[data-milestone-id="2"]').hasClass('bg-yellow');
    });
});
