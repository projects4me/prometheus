import { click, currentURL, fillIn, focus, settled, triggerKeyEvent } from '@ember/test-helpers';
import steps from '../steps';

const BROWSER = '[data-idea-browser]';
const INPUT = `${BROWSER} [data-field="ez-search-input"] input, ${BROWSER} input[data-field="ez-search-input"]`;

async function type(text) {
    await focus(INPUT);
    await fillIn(INPUT, text);
}

async function enter() {
    await triggerKeyEvent(INPUT, 'keydown', 'Escape');
    await triggerKeyEvent(INPUT, 'keydown', 'Enter');
    await settled();
}

export const given = function () {
    return [
        {
            'The idea saved search $name is $query': (assert, ctx) => async function (name, query) {
                let project = ctx.get('currentProject');
                server.create('savedsearch', { name, relatedTo: 'idea', searchquery: query, projectId: project.id });
                assert.ok(true, `saved search ${name} exists`);
            }
        },
    ];
};

export const when = function () {
    return [
        {
            'User types "$text" in the idea search bar and presses Enter': (assert) => async function (text) {
                await type(text);
                await enter();
            }
        },
        {
            'User tries "$text" in the idea search bar': (assert, ctx) => async function (text) {
                ctx.set('ideaRequestsBefore', (ctx.get('ideaQueries') || []).length);
                await type(text);
                await enter();
            }
        },
        {
            'User removes the first applied filter of the idea search': (assert) => async function () {
                await click(`${BROWSER} [data-ez-chip]`);
                await settled();
            }
        },
        {
            'User selects the idea saved search': (assert) => async function () {
                await click(`${BROWSER} [data-ez-saved] button`);
                await click(`${BROWSER} [data-ez-saved-item]`);
                await settled();
            }
        },
        {
            'User updates the active idea saved search': (assert) => async function () {
                await click(`${BROWSER} [data-ez-saved] button`);
                await click(`${BROWSER} [data-ez-saved-update]`);
                await settled();
            }
        },
    ];
};

export const then = function () {
    return [
        {
            'The idea list was requested with "$text"': (assert, ctx) => async function (text) {
                let sent = ctx.get('ideaQueries') || [];
                assert.ok(sent.some(query => (query || '').includes(text)), `sent ${sent.join(' | ')}`);
            }
        },
        {
            'The idea list was requested with no search': (assert, ctx) => async function () {
                assert.notOk((ctx.get('lastIdeaQuery') || '').includes('CONTAINS'), `sent ${ctx.get('lastIdeaQuery')}`);
            }
        },
        {
            'The idea browser count reads $text': (assert) => async function (text) {
                assert.dom(`${BROWSER} [data-idea-count]`).hasText(text);
            }
        },
        {
            'The idea saved search button shows $name': (assert) => async function (name) {
                assert.dom(`${BROWSER} [data-ez-saved-name]`).hasText(name);
            }
        },
        {
            'The idea saved search button shows edited': (assert) => async function () {
                assert.dom(`${BROWSER} [data-ez-saved-edited]`).exists();
            }
        },
        {
            'The idea saved search button does not show edited': (assert) => async function () {
                assert.dom(`${BROWSER} [data-ez-saved-edited]`).doesNotExist();
            }
        },
        {
            'The archived footer is hidden': (assert) => async function () {
                assert.dom(`${BROWSER} [data-toggle-archived]`).doesNotExist();
            }
        },
        {
            'The idea url keeps the search': (assert) => async function () {
                assert.ok(currentURL().includes('query='), currentURL());
            }
        },
        {
            'The idea search shows an error': (assert) => async function () {
                assert.dom(`${BROWSER} [data-ez-error]`).exists();
            }
        },
        {
            'No new idea request was made': (assert, ctx) => async function () {
                assert.strictEqual((ctx.get('ideaQueries') || []).length, ctx.get('ideaRequestsBefore'));
            }
        },
    ];
};

export default function (assert) {
    return steps(assert);
}
