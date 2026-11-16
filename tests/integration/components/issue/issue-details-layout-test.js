/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import AclStub from '../../stub-services/acl-stub';

const ASSIGNEE_AVATAR = '[data-field="issue.assignee"] [data-test-avatar]';

module('Integration | Component | issue/issue-details layout', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:current-user', class extends Service { user = EmberObject.create({ id: '1' }); });
        this.set('projectController', EmberObject.create({ members: [], membersList: [], issuesList: [], projectId: '1' }));
        this.set(
            'issue',
            EmberObject.create({
                id: '1',
                issueNumber: 1,
                subject: 'Narrow',
                description: 'word '.repeat(40) + 'https://example.com/' + 'a'.repeat(120),
                assignedTo: EmberObject.create({ id: '7', name: 'Alexandria Montgomery-Longname', type: 'user' }),
                timelogs: [],
                comments: [],
                files: [],
            })
        );
        this.hostStyle = document.createElement('style');
        document.head.appendChild(this.hostStyle);
    });

    hooks.afterEach(function () {
        this.hostStyle.remove();
    });

    test('the description starts to the right of the assignee column in a narrow container', async function (assert) {
        this.hostStyle.textContent = '.narrow-details-host { width: 320px; }';
        await render(hbs`
            <div id="narrow" class="narrow-details-host">
                <Issue::IssueDetails @issue={{this.issue}} @projectController={{this.projectController}} />
            </div>
        `);
        await waitUntil(() => document.querySelector(ASSIGNEE_AVATAR).dataset.size !== 'l', { timeoutMessage: 'avatar did not step down' });
        await settled();
        const assignee = document.querySelector('[data-field="issue.assignee"] .app-ui-avatar').getBoundingClientRect();
        const description = document.querySelector('[data-field="issue.description"]').getBoundingClientRect();
        assert.ok(description.left >= assignee.right, 'description does not overlap the assignee avatar');
        assert.ok(description.right <= document.querySelector('#narrow').getBoundingClientRect().right + 1, 'description stays inside the container');
    });

    test('the assignee avatar steps down in a narrow container', async function (assert) {
        this.hostStyle.textContent = '.narrow-details-host { width: 320px; }';
        await render(hbs`
            <div class="narrow-details-host">
                <Issue::IssueDetails @issue={{this.issue}} @projectController={{this.projectController}} />
            </div>
        `);
        await waitUntil(() => document.querySelector(ASSIGNEE_AVATAR).dataset.size !== 'l', { timeoutMessage: 'avatar did not step down' });
        const avatar = document.querySelector(ASSIGNEE_AVATAR);
        assert.ok(['m', 'ml'].includes(avatar.dataset.size), `renders m or ml (got ${avatar.dataset.size})`);
        const column = document.querySelector('[data-field="issue.assignee"]').getBoundingClientRect();
        assert.ok(avatar.getBoundingClientRect().right <= column.right + 1, 'avatar stays inside its column');
    });

    test('the assignee avatar is large at full width', async function (assert) {
        this.hostStyle.textContent = '.wide-details-host { width: 1200px; }';
        await render(hbs`
            <div class="wide-details-host">
                <Issue::IssueDetails @issue={{this.issue}} @projectController={{this.projectController}} />
            </div>
        `);
        assert.strictEqual(document.querySelector(ASSIGNEE_AVATAR).dataset.size, 'l');
    });
});
