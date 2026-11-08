import { click, currentURL, fillIn, focus, settled, triggerKeyEvent, waitUntil } from '@ember/test-helpers';
import Sortable from 'sortablejs';
import steps from '../steps';

const SEARCH = '[data-milestones-taskboard-search]';
const INPUT = `${SEARCH} [data-field="ez-search-input"] input, ${SEARCH} input[data-field="ez-search-input"]`;

export const given = function () {
    return [
        {
            'The board saved search $name is $query': (assert, ctx) => async function (name, query) {
                let project = ctx.get('currentProject') || ctx.get('project');
                server.create('savedsearch', { name, relatedTo: 'issue', searchquery: query, projectId: project.id });
                assert.ok(true, `saved search ${name} exists`);
            }
        },
    ];
};

export const when = function () {
    return [
        {
            'User types "$text" in the board search and presses Enter': (assert, ctx) => async function (text) {
                ctx.set('issueQueries', []);
                await focus(INPUT);
                await fillIn(INPUT, text);
                await triggerKeyEvent(INPUT, 'keydown', 'Escape');
                await triggerKeyEvent(INPUT, 'keydown', 'Enter');
                await settled();
            }
        },
        {
            'User opens the board Filter modal': () => async function () {
                await click(`${SEARCH} [data-ez-builder-toggle]`);
                await waitUntil(() => document.querySelector('.modal.in .modal-dialog'));
            }
        },
        {
            'User adds a condition and searches in the board Filter modal': (assert, ctx) => async function () {
                ctx.set('issueQueries', []);
                await click('.modal [data-ez-add-condition]');
                await click('.modal [data-btn="save"]');
                await settled();
            }
        },
        {
            'User clears the board search': (assert, ctx) => async function () {
                ctx.set('issueQueries', []);
                await click(`${SEARCH} [data-ez-search-clear]`);
                await settled();
            }
        },
        {
            'User selects the board saved search': (assert) => async function () {
                await click(`${SEARCH} [data-ez-saved] button`);
                await click(`${SEARCH} [data-ez-saved-item]`);
                await settled();
            }
        },
    ];
};

export const then = function () {
    return [
        {
            'Every board lane was requested with "$text"': (assert, ctx) => async function (text) {
                let sent = ctx.get('issueQueries') || [];
                let milestoneQueries = sent.filter(query => (query || '').includes('Issue.milestoneId'));
                assert.ok(milestoneQueries.length > 0, `lane requests sent: ${sent.join(' | ')}`);
                assert.ok(milestoneQueries.every(query => query.includes(text)), `sent ${milestoneQueries.join(' | ')}`);
                assert.ok(sent.filter(query => (query || '').includes('NULL')).every(query => query.includes(text)), 'backlog requested with the search');
            }
        },
        {
            'The board Filter modal is the top element at its centre': (assert) => async function () {
                // The test runner scales #ember-testing, which makes it a stacking context of its own; the app root is
                // the body in production, so take that context away to check the real stacking.
                [document.querySelector('#ember-testing'), document.querySelector('#ember-testing-container')].forEach((root) => {
                    Object.assign(root.style, { transform: 'none', zoom: '1', position: 'static', zIndex: 'auto', overflow: 'visible' });
                });
                let dialog = document.querySelector('.modal .modal-dialog');
                let rect = dialog.getBoundingClientRect();
                let top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
                assert.ok(top && dialog.contains(top), `the dialog is on top of the overlay, got ${top && top.outerHTML.slice(0, 120)}`);
                assert.notOk(document.querySelector(SEARCH).contains(dialog), 'the modal is outside the board search');
            }
        },
        {
            'The board Filter modal and its backdrop are gone': (assert) => async function () {
                await waitUntil(() => !document.querySelector('.modal'));
                assert.dom('.modal').doesNotExist();
                assert.dom('.modal-backdrop').doesNotExist();
            }
        },
        {
            'The board saved search button shows $name': (assert) => async function (name) {
                assert.dom(`${SEARCH} [data-ez-saved-name]`).hasText(name);
            }
        },
        {
            'The board url has a searchId': (assert) => async function () {
                assert.ok(currentURL().includes('searchId='), currentURL());
            }
        },
        {
            'The last board request has no search': (assert, ctx) => async function () {
                let sent = ctx.get('issueQueries') || [];
                assert.ok(sent.length > 0, 'the board was requested again');
                assert.ok(sent.every(query => !(query || '').includes('CONTAINS')), `sent ${sent.join(' | ')}`);
            }
        },
        {
            'Every board lane can be sorted': (assert) => async function () {
                let lanes = [...document.querySelectorAll('.lane.box-body')];
                assert.ok(lanes.length > 0, 'lanes are rendered');
                assert.ok(lanes.every(lane => Sortable.get(lane)), 'every lane has Sortable');
            }
        },
        {
            'The board search and the milestone tabs share one row': (assert) => async function () {
                let search = document.querySelector(SEARCH).getBoundingClientRect();
                let tabs = document.querySelector('.milestone-tabs').getBoundingClientRect();
                assert.ok(Math.abs(search.top - tabs.top) < 20 || (search.top < tabs.bottom && search.bottom > tabs.top), `search top ${search.top}, tabs top ${tabs.top}`);
            }
        },
    ];
};

export default function (assert) {
    return steps(assert);
}
