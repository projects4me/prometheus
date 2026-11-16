/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import AclStub from '../../stub-services/acl-stub';

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
    });

    test('the description starts to the right of the assignee column in a narrow container', async function (assert) {
        const style = document.createElement('style');
        style.textContent = '.narrow-details-host { width: 320px; }';
        document.head.appendChild(style);
        await render(hbs`
            <div id="narrow" class="narrow-details-host">
                <Issue::IssueDetails @issue={{this.issue}} @projectController={{this.projectController}} />
            </div>
        `);
        const assignee = document.querySelector('[data-field="issue.assignee"] .app-ui-avatar').getBoundingClientRect();
        const description = document.querySelector('[data-field="issue.description"]').getBoundingClientRect();
        assert.ok(description.left >= assignee.right, 'description does not overlap the assignee avatar');
        style.remove();
        assert.ok(description.right <= document.querySelector('#narrow').getBoundingClientRect().right + 1, 'description stays inside the container');
    });
});
