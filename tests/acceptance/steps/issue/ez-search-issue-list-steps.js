import { click, currentURL, fillIn, focus, settled, triggerKeyEvent } from '@ember/test-helpers';
import steps from '../steps';

const INPUT = '[data-field="ez-search-input"] input, input[data-field="ez-search-input"]';
const PROJECT = '(Issue.projectId : ';

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
            'The issue statuses are available': (assert) => async function () {
                server.createList('issuestatus', 4);
            }
        },
    ];
}

export const when = function () {
    return [
        {
            'User types "$text" in the issue search bar and presses Enter': (assert) => async function (text) {
                await type(text);
                await enter();
            }
        },
        {
            'User types "$text" in the issue search bar': (assert, ctx) => async function (text) {
                await type(text);
                await settled();
            }
        },
        {
            'User tries "$text" in the issue search bar': (assert, ctx) => async function (text) {
                ctx.set('issueRequestsBefore', (ctx.get('issueQueries') || []).length);
                await type(text);
                await enter();
            }
        },
        {
            'User presses Down and Tab in the issue search bar': (assert) => async function () {
                await triggerKeyEvent(INPUT, 'keydown', 'ArrowDown');
                await triggerKeyEvent(INPUT, 'keydown', 'Tab');
                await settled();
            }
        },
        {
            'User types "$text" at the end of the issue search bar and presses Enter': (assert) => async function (text) {
                let input = document.querySelector(INPUT);
                await fillIn(INPUT, `${input.value}${text}`);
                await enter();
            }
        },
        {
            'User updates the active saved search in the issue ezSearch': (assert) => async function () {
                await click('[data-ez-saved] button');
                await click('[data-ez-saved-update]');
            }
        },
        {
            'User opens the issue search builder': (assert) => async function () {
                await click('[data-ez-builder-toggle]');
            }
        },
        {
            'User adds a Status condition in the issue search builder': (assert) => async function () {
                await click('[data-ez-add-condition]');
                await click('[data-ez-condition] [data-field="ez-search.condition.field"] .ember-power-select-trigger');
                let option = [...document.querySelectorAll('.ember-power-select-option')].find((el) => /status/i.test(el.textContent));
                await click(option);
                await click('[data-ez-condition] [data-field="ez-search.value"] .ember-power-select-trigger');
                await click(document.querySelector('.ember-power-select-option'));
            }
        },
    ];
}

export const then = function () {
    return [
        {
            'the issue search bar shows "$text"': (assert) => async function (text) {
                assert.dom(INPUT).hasValue(text);
            }
        },
        {
            'the issue saved search button shows edited': (assert) => async function () {
                assert.dom('[data-ez-saved-edited]').exists();
            }
        },
        {
            'the issue saved search button does not show edited': (assert) => async function () {
                assert.dom('[data-ez-saved-edited]').doesNotExist();
            }
        },
        {
            'the issue search bar contains "$text"': (assert) => async function (text) {
                assert.ok(document.querySelector(INPUT).value.includes(text), `the bar contains ${text}`);
            }
        },
        {
            'the issue list was queried with "$text" and the project': (assert, ctx) => async function (text) {
                let sent = ctx.get('lastIssueQuery');
                assert.ok(sent.startsWith(`((${text}) AND ${PROJECT}`), `sent ${sent}`);
            }
        },
        {
            'the issue list was queried with "$text" in it': (assert, ctx) => async function (text) {
                assert.ok(ctx.get('lastIssueQuery').includes(text), `sent ${ctx.get('lastIssueQuery')}`);
            }
        },
        {
            'the url has a query': (assert) => async function () {
                assert.ok(currentURL().includes('query='), currentURL());
            }
        },
        {
            'the url has a saved search id': (assert) => async function () {
                assert.ok(currentURL().includes('searchId='), currentURL());
            }
        },
        {
            'the issue search shows an error': (assert) => async function () {
                assert.dom('[data-ez-search] [data-ez-error]').exists();
            }
        },
        {
            'the issue search button is disabled': (assert) => async function () {
                assert.dom('[data-ez-search-apply]').isDisabled();
            }
        },
        {
            'no new issue request was made': (assert, ctx) => async function () {
                assert.strictEqual((ctx.get('issueQueries') || []).length, ctx.get('issueRequestsBefore'));
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}
