/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | idea/summary-box', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('it shows the facts of the idea', async function (assert) {
        this.set('idea', { dateCreated: '2026-01-01 10:00:00', dateModified: '2026-01-02 10:00:00' });
        this.set('messages', [{ costUsd: 0.5 }, { costUsd: 0.25 }, { costUsd: null }]);
        this.set('plans', [{ id: '1' }, { id: '2' }]);
        await render(hbs`<Idea::SummaryBox @idea={{this.idea}} @messages={{this.messages}} @plans={{this.plans}} @createdUserName="User 1" />`);

        assert.dom('[data-idea-summary-created]').includesText('User 1');
        assert.dom('[data-idea-summary-messages] small').hasText('3');
        assert.dom('[data-idea-summary-versions] small').hasText('2');
        assert.dom('[data-idea-summary-cost] small').hasText('$0.7500');
    });
});
