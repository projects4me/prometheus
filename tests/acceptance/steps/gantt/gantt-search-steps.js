import { click, currentURL, fillIn, focus, settled, waitUntil } from '@ember/test-helpers';
import steps from '../steps';
import { runSearch } from '../ez-search-run';

const BAR = '[data-gantt-search]';
const INPUT = `${BAR} [data-field="ez-search-input"] input, ${BAR} input[data-field="ez-search-input"]`;

async function type(text) {
    await focus(INPUT);
    await fillIn(INPUT, text);
    await settled();
}

/**
 * Presses Enter; the gantt reloads its milestones and then their issues in a chain, so wait for the
 * url to follow the query before settling.
 */
async function enter(expectUrlChange = true) {
    let before = currentURL();
    await runSearch(INPUT);
    if (expectUrlChange) {
        await waitUntil(() => currentURL() !== before, { timeout: 3000 });
    }
    await settled();
}

export const given = function () {
    return [
        {
            'The gantt saved search $name is $query': (assert, ctx) => async function (name, query) {
                let project = ctx.get('currentProject');
                server.create('savedsearch', { name, relatedTo: 'issue', searchquery: query, projectId: project.id });
                assert.ok(true, `saved search ${name} exists`);
            }
        },
    ];
};

export const when = function () {
    return [
        {
            'User types "$text" in the gantt search bar and presses Enter': (assert) => async function (text) {
                await type(text);
                await enter();
            }
        },
        {
            'User tries "$text" in the gantt search bar': (assert, ctx) => async function (text) {
                ctx.set('ganttRequestsBefore', (ctx.get('issueQueries') || []).length);
                await type(text);
                await enter(false);
            }
        },
        {
            'User removes the first applied filter of the gantt search': (assert) => async function () {
                let before = currentURL();
                await click(`${BAR} [data-ez-chip]`);
                await waitUntil(() => currentURL() !== before, { timeout: 3000 });
                await settled();
            }
        },
        {
            'User saves the gantt search as $name': (assert) => async function (name) {
                await click(`${BAR} [data-ez-saved] button`);
                await click(`${BAR} [data-ez-save]`);
                assert.dom('[data-save-search-query]').includesText('Issue.subject');
                await fillIn('.modal input', name);
                await click('.modal [data-btn="save"]');
                await settled();
            }
        },
        {
            'User selects the gantt saved search': (assert) => async function () {
                await click(`${BAR} [data-ez-saved] button`);
                await click(`${BAR} [data-ez-saved-item]`);
                await settled();
            }
        },
    ];
};

export const then = function () {
    return [
        {
            'The gantt issues were requested with "$text" and the milestone and project': (assert, ctx) => async function (text) {
                let sent = ctx.get('issueQueries') || [];
                assert.ok(
                    sent.some(query => (query || '').includes(text) && query.includes('Issue.milestoneId') && query.includes('Issue.projectId')),
                    `sent ${sent.join(' | ')}`
                );
            }
        },
        {
            'The last gantt issue request has no search': (assert, ctx) => async function () {
                let last = ctx.get('lastIssueQuery') || '';
                assert.ok(last.includes('Issue.milestoneId'), last);
                assert.notOk(last.includes('Issue.subject'), last);
            }
        },
        {
            'The gantt url keeps the search': (assert) => async function () {
                assert.ok(currentURL().includes('query='), currentURL());
            }
        },
        {
            'The gantt saved search button shows $name': (assert) => async function (name) {
                assert.dom(`${BAR} [data-ez-saved-name]`).hasText(name);
            }
        },
        {
            'A gantt saved search $name of the issues was stored with "$text"': (assert, ctx) => async function (name, text) {
                let stored = server.db.savedsearches.where({ name });
                assert.strictEqual(stored.length, 1, `saved search ${name} stored`);
                assert.strictEqual(stored[0].relatedTo, 'issue');
                assert.strictEqual(String(stored[0].projectId), String(ctx.get('currentProject').id));
                assert.ok((stored[0].searchquery || '').includes(text), stored[0].searchquery);
            }
        },
        {
            'The gantt saved search list has $name': (assert) => async function (name) {
                await click(`${BAR} [data-ez-saved] button`);
                assert.dom(`${BAR} [data-ez-saved-item]`).exists({ count: 1 });
                assert.dom(`${BAR} [data-ez-saved-item]`).includesText(name);
            }
        },
        {
            'The gantt save dialog is closed': (assert) => async function () {
                await waitUntil(() => !document.querySelector('.modal-backdrop'), { timeout: 3000 });
                assert.dom('.modal').doesNotExist();
                assert.dom('.modal-backdrop').doesNotExist();
            }
        },
        {
            'The gantt search shows an error': (assert) => async function () {
                assert.dom(`${BAR} [data-ez-error]`).exists();
            }
        },
        {
            'No new gantt issue request was made': (assert, ctx) => async function () {
                assert.strictEqual((ctx.get('issueQueries') || []).length, ctx.get('ganttRequestsBefore'));
            }
        },
    ];
};

export default function (assert) {
    return steps(assert);
}
