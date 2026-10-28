/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/task-board/milestones', function (hooks) {
    setupRenderingTest(hooks);

    test('card subject has a title and stays inside the card', async function (assert) {
        let subject = 'OAuthServer::addRefreshTokenGrantWithAVeryLongUnbrokenTokenName';

        this.set('milestone', {
            id: 1,
            issues: [{
                id: 1,
                issueNumber: 1,
                subject,
                status: 'open',
                priority: 'medium',
                issuetype: { name: 'Bug', get() { return null; } },
                dateModified: '2026-01-01'
            }]
        });
        this.set('statuses', [{ id: 1, name: 'open' }]);
        this.set('noop', () => {});
        this.set("statusClass", {});

        await render(hbs`
            <div class="board" style="width: 150px">
                <AppUi::TaskBoard::Milestones
                    @milestone={{this.milestone}}
                    @statuses={{this.statuses}}
                    @statusClass={{this.statusClass}}
                    @selectIssue={{this.noop}}
                    @getMilestoneProgress={{this.noop}}
                    @getCompletedIssuesCount={{this.noop}}
                />
            </div>
        `);

        let link = this.element.querySelector('.issue-card-subject a');
        assert.ok(link, 'subject link is rendered');
        assert.strictEqual(link.getAttribute('title'), subject, 'subject link has the full subject as title');

        let style = window.getComputedStyle(link);
        assert.ok(['anywhere', 'break-word'].includes(style.overflowWrap) || style.wordBreak === 'break-word',
            'long tokens are allowed to break');
        assert.strictEqual(style.overflow, 'hidden', 'subject overflow is hidden');
    });
});
