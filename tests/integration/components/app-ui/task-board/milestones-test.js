/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

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

        // The real observer reports lanes in view asynchronously and would override the tapped chip
        let RealObserver = window.IntersectionObserver;
        window.IntersectionObserver = undefined;
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
        window.IntersectionObserver = RealObserver;
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

    test('an empty lane shows the empty state, a filled lane does not', async function (assert) {
        this.set('milestone', { id: 1, issues: [{
            id: 1, issueNumber: 1, subject: 'Issue 1', status: 'open', priority: 'medium',
            issuetype: { name: 'Bug', get() { return null; } }, dateModified: '2026-01-01'
        }] });
        this.set('statuses', [{ id: 1, name: 'open' }, { id: 2, name: 'inprogress' }]);
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

        assert.dom('[data-lane-empty="open"]').doesNotExist('a lane with issues has no empty state');
        assert.dom('[data-lane-empty="inprogress"]').exists('an empty lane has the empty state');
        assert.dom('[data-lane-empty="inprogress"] .fa-inbox').exists('the empty state has the inbox icon');
        assert.dom('[data-lane-empty="inprogress"] span').hasText(/^No issues in /, 'the empty state names the status');
    });

    test('every lane starts with an add row that opens the add issue dialog', async function (assert) {
        this.set('milestone', { id: 1, issues: [{
            id: 1, issueNumber: 1, subject: 'Issue 1', status: 'open', priority: 'medium',
            issuetype: { name: 'Bug', get() { return null; } }, dateModified: '2026-01-01'
        }] });
        this.set('statuses', [{ id: 1, name: 'open' }, { id: 2, name: 'inprogress' }]);
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

        assert.dom('[data-lane-add]').exists({ count: 2 }, 'filled and empty lanes both have the row');
        assert.dom('[data-lane-add="inprogress"] .fa-plus').exists('the row has the plus icon');
        assert.dom('[data-lane-add="inprogress"]').includesText('Add to', 'the row says what it does');
        assert.dom('[data-lane-add="inprogress"] .lane-add-status').exists('the status label is in its own span');
    });

    test('the add row is hidden without issue.create', async function (assert) {
        this.owner.register('service:acl', class extends Service {
            checkAccess() {
                return false;
            }
        });
        this.set('milestone', { id: 1, issues: [] });
        this.set('statuses', [{ id: 1, name: 'open' }]);
        this.set('noop', () => {});
        this.set('statusClass', {});

        await render(hbs`
            <AppUi::TaskBoard::Milestones
                @milestone={{this.milestone}}
                @statuses={{this.statuses}}
                @statusClass={{this.statusClass}}
                @selectIssue={{this.noop}}
                @getMilestoneProgress={{this.noop}}
                @getCompletedIssuesCount={{this.noop}}
            />
        `);

        assert.dom('[data-lane-add]').doesNotExist();
    });
    test('assignee caret stays beside the avatar when the footer has several tags', async function (assert) {
        this.set('milestone', {
            id: 1,
            issues: [{
                id: 1,
                issueNumber: 1,
                subject: 'Several tags',
                status: 'open',
                priority: 'medium',
                issuetype: { name: 'Task', get() { return null; } },
                infoTag: 'Reopened',
                files: [{ id: 1 }, { id: 2 }],
                comments: [{ id: 1 }, { id: 2 }],
                assignedTo: { id: 1, name: 'Some Person' },
                dateModified: '2026-01-01'
            }]
        });
        this.set('statuses', [{ id: 1, name: 'open' }]);
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

        this.element.querySelector('.board').style.width = '260px';

        let toggle = this.element.querySelector('.issue-card-assignee [data-issue-assignee-toggle]');
        let caret = toggle.querySelector('.fa-caret-down');
        let avatar = toggle.firstElementChild;
        let avatarBox = avatar.getBoundingClientRect();
        let caretBox = caret.getBoundingClientRect();

        assert.strictEqual(window.getComputedStyle(toggle).display, 'inline-flex', 'toggle is inline-flex');
        let sameLine = caretBox.top < avatarBox.bottom;
        assert.true(sameLine, 'caret is on the same line as the avatar');
        assert.strictEqual(window.getComputedStyle(this.element.querySelector('.issue-card-right-meta')).flexShrink, '0', 'right meta does not shrink');
    });
});
