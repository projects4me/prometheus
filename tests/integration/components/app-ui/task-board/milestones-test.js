/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
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

    test('status bar chips show counts and scroll to their lane', async function (assert) {
        let issue = (id, status) => ({
            id, issueNumber: id, subject: `Issue ${id}`, status, priority: 'medium',
            issuetype: { name: 'Bug', get() { return null; } }, dateModified: '2026-01-01'
        });
        this.set('milestone', { id: 1, issues: [issue(1, 'open'), issue(2, 'open'), issue(3, 'done')] });
        this.set('statuses', [{ id: 1, name: 'open' }, { id: 2, name: 'inprogress' }, { id: 3, name: 'done' }]);
        this.set('noop', () => {});
        this.set('statusClass', {});

        await render(hbs`
            <div class="board">
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

        let chips = this.element.querySelectorAll('[data-lane-chip]');
        assert.strictEqual(chips.length, 3, 'one chip per status');
        assert.ok(chips[0].textContent.includes('(2)'), 'chip shows the count');

        let board = this.element.querySelector('.milestone.box-body');
        let scrolls = [];
        board.scrollTo = (options) => scrolls.push(options);

        await click('[data-lane-chip="done"]');
        assert.ok(chips[2].classList.contains('is-active'), 'tapped chip is highlighted');
        assert.strictEqual(scrolls.length, 1, 'the board is asked to scroll once');
        assert.strictEqual(typeof scrolls[0].left, 'number', 'to the position of the lane');
    });

    test('phone dropdown lists the milestones and switching shows that milestone', async function (assert) {
        this.set('milestones', [
            { id: null, name: 'Backlog', milestoneType: 'backlog', issues: [{ id: 1 }] },
            { id: 5, name: 'Sprint 5', milestoneType: 'sprint', issues: [] }
        ]);
        this.set('statuses', []);
        this.set('statusClass', {});
        this.set('noop', () => 0);

        await render(hbs`
            <AppUi::TaskBoard @milestones={{this.milestones}} @statuses={{this.statuses}} @statusClass={{this.statusClass}} @selectIssue={{this.noop}} @getMilestoneProgress={{this.noop}} @getCompletedIssuesCount={{this.noop}} />
        `);

        assert.dom('[data-milestone-select-row] .milestone-mark-complete-mobile').doesNotExist('no Complete button for Backlog');
        await click('[data-milestone-select-row] .ember-power-select-trigger');
        let options = document.querySelectorAll('.ember-power-select-option');
        assert.strictEqual(options.length, 2, 'one option per milestone');
        await click(options[1]);
        assert.dom('#tab_5').hasClass('active', 'the chosen milestone pane is shown');
        assert.dom('[data-milestone-select-row] .milestone-mark-complete-mobile').exists('Complete button shows for a sprint');
    });
});
