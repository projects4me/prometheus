import { currentURL, visit } from '@ember/test-helpers';
import { Response } from 'miragejs';
import ENV from 'prometheus/config/environment';
import steps from '../steps';

/**
 * Replaces the Mirage handler of a model so the requests matching `fails` answer with `status` and the
 * others keep their default answer (also inside Gaia's bulk resource, which looks the handler up by URL).
 */
function failRequests(modelName, fails, status, failBody) {
    let url = `${ENV.api.host}/api/v${ENV.api.version}/${modelName}`;
    let original = server.pretender._handlerFor('GET', url, { method: 'GET', url, requestHeaders: {} }).handler;
    server.get(`/${modelName}`, async (schema, request) => {
        if (fails(request)) {
            return new Response(status, {}, failBody);
        }
        let [code, headers, body] = await original(request);
        return new Response(code, headers, typeof body === 'string' && body ? JSON.parse(body) : body);
    });
}

export const given = function () {
    return [
        {
            'The issues of the first gantt milestone answer 404': (assert) => async function () {
                let milestone = server.db.milestones[0];
                failRequests('issue', (request) => decodeURIComponent(request.url).includes(`Issue.milestoneId : ${milestone.id})`), 404, { errors: 'Not Found' });
                assert.ok(true, 'the first milestone lane fails');
            }
        },
        {
            'The gantt time log requests answer 404': (assert) => async function () {
                failRequests('timelog', () => true, 404, { errors: 'Not Found' });
                assert.ok(true, 'the time logs fail');
            }
        },
        {
            'The gantt milestones request answers $status': (assert) => async function (status) {
                let code = Number(status);
                let body = code === 403 ? { error: 'Access denied to milestone' } : { errors: 'Not Found' };
                // only the Gantt's own query (in progress and planned milestones) fails
                failRequests('milestone', (request) => decodeURIComponent(request.url).includes('Milestone.status : planned'), code, body);
                assert.ok(true, `the milestones answer ${status}`);
            }
        },
    ];
};

export const when = function () {
    return [
        {
            'User opens the gantt and is redirected': (assert) => async function () {
                // the shared navigation step expects to stay on the visited url
                await visit('/app/project/project_1/gantt');
                assert.ok(true, 'the gantt was opened');
            }
        },
    ];
};

export const then = function () {
    return [
        {
            'The gantt shows $count milestone rows': (assert) => async function (count) {
                assert.dom('[data-test-gantt-grid] .milestone-row').exists({ count: Number(count) });
            }
        },
        {
            'The gantt shows the warning "$message" once': (assert) => async function (message) {
                let shown = [...document.querySelectorAll('.messenger-message.message-warning .messenger-message-inner')].filter((el) => el.textContent.trim() === message);
                assert.strictEqual(shown.length, 1, `the warning "${message}" is shown once`);
            }
        },
        {
            'The gantt shows the $type message "$message"': (assert) => async function (type, message) {
                let shown = [...document.querySelectorAll(`.messenger-message.message-${type} .messenger-message-inner`)];
                assert.ok(shown.some((el) => el.textContent.trim() === message), `the ${type} message "${message}" is shown`);
            }
        },
        {
            'The gantt went to the access denied page': (assert) => async function () {
                assert.ok(currentURL().includes('access-denied'), `the url ${currentURL()} is the access denied page`);
            }
        },
        {
            'The gantt shows no milestone and no error page': (assert) => async function () {
                assert.dom('.milestone-row').doesNotExist();
                assert.dom('.error-page').doesNotExist();
            }
        },
    ];
};

export default function (assert) {
    return steps(assert);
}
