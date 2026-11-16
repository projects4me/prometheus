import { click, visit } from '@ember/test-helpers';
import steps from '../steps';

const BOX = '.project-milestones-section';
const CHART_FIELD = '[data-field="project.estimated-spent-milestone"]';

function listedNames() {
    return [...document.querySelectorAll(`${BOX} [data-milestone="details"]`)]
        .map(node => node.textContent.trim().replace(/ - \d+ .*$/, ''));
}

export const given = function () {
    return [
        {
            "The dashboard requests are recorded": (assert, ctx) => async function () {
                ctx.set('dashboardRequests', []);
                server.pretender.handledRequest = (verb, path) => {
                    ctx.set('dashboardRequests', [...ctx.get('dashboardRequests'), `${verb} ${path.split('?')[0]}`]);
                };
                assert.ok(true, 'requests are recorded');
            }
        },
        {
            "The project has $count milestones": (assert, ctx) => async function (count) {
                let project = ctx.get('currentProject');
                for (let i = 1; i <= Number(count); i++) {
                    server.create('milestone', {
                        projectId: project.id,
                        name: `Milestone ${String(i).padStart(2, '0')}`,
                        startDate: `2026-10-${String(i).padStart(2, '0')}`
                    });
                }
                assert.ok(true, `${count} milestones exist`);
            }
        },
        {
            "Another project has $count newer milestones": (assert) => async function (count) {
                let other = server.create('project', { name: 'Other project' });
                for (let i = 1; i <= Number(count); i++) {
                    server.create('milestone', {
                        projectId: other.id,
                        name: `Other ${i}`,
                        startDate: `2026-12-${String(i).padStart(2, '0')}`
                    });
                }
                assert.ok(true, `${count} milestones of another project exist`);
            }
        },
        {
            "The second page of milestones fails to load": (assert, ctx) => async function () {
                ctx.set('milestonePageFails', true);
                assert.ok(true, 'page 2 requests fail');
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "The second page of milestones loads again": (assert, ctx) => async function () {
                ctx.set('milestonePageFails', false);
                assert.ok(true, 'page 2 requests succeed');
            }
        },
        {
            "User opens the dashboard of the project": (assert, ctx) => async function () {
                let project = ctx.get('currentProject');
                await visit(`/app/project/${project.shortCode}`);
                assert.ok(true, 'User opens the dashboard of the project');
            }
        },
        {
            "User pages the milestones box forward": (assert) => async function () {
                await click(`${BOX} [data-test-pager-next]`);
                assert.ok(true, 'User pages forward');
            }
        },
        {
            "User retries the milestones page": (assert) => async function () {
                await click(`${BOX} [data-test-milestones-retry]`);
                assert.ok(true, 'User retries');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The dashboard sent one bulk request and no separate box requests": (assert, ctx) => async function () {
                let sent = ctx.get('dashboardRequests') || [];
                let count = (verb, model) => sent.filter((r) => r === `${verb} ${model}` || r.endsWith(`/${model}`) && r.startsWith(verb)).length;
                assert.strictEqual(sent.filter((r) => r.startsWith('POST') && r.endsWith('/bulk')).length, 1, sent.join(' | '));
                // the milestones box pages itself (limit 5) and is out of the bulk; the rest come through bulk
                ['activity', 'conversationroom'].forEach((model) => {
                    assert.strictEqual(count('GET', model), 0, sent.join(' | '));
                });
            }
        },
        {
            "The milestones box requested page $page with limit $limit": (assert, ctx) => async function (page, limit) {
                let requests = (ctx.get('milestoneRequests') || []).filter(params => params.page);
                let last = requests.filter(params => String(params.page) === page).pop();
                assert.ok(last, `page ${page} was requested`);
                assert.equal(last?.limit, limit, 'the page size is the limit');
                assert.ok(requests.every(params => params.limit === '5'), 'no request for the box asks for more than 5');
                assert.notOk(requests.some(params => Number(params.page) > Number(page)), 'no later page was requested');
            }
        },
        {
            "The milestones box lists the milestones $names": (assert) => async function (names) {
                assert.deepEqual(listedNames(), names.split(', '));
            }
        },
        {
            "The milestones pager reads $range": (assert) => async function (range) {
                assert.dom(`${BOX} [data-test-pager-range]`).hasText(range);
            }
        },
        {
            "The milestones previous button is disabled": (assert) => async function () {
                assert.dom(`${BOX} [data-test-pager-previous]`).isDisabled();
            }
        },
        {
            "The milestones next button is disabled": (assert) => async function () {
                assert.dom(`${BOX} [data-test-pager-next]`).isDisabled();
            }
        },
        {
            "The milestones pager is not shown": (assert) => async function () {
                assert.dom(`${BOX} [data-test-pager]`).doesNotExist();
            }
        },
        {
            "The milestones box shows the empty state": (assert) => async function () {
                assert.dom(`${BOX} [data-milestone="details"]`).doesNotExist();
                assert.dom(`${BOX} .box-body`).includesText('No milestone found for the project');
            }
        },
        {
            "The milestones box shows the error": (assert) => async function () {
                assert.dom(`${BOX} [data-test-milestones-error]`).exists();
                assert.dom(`${BOX} [data-milestone="details"]`).doesNotExist();
            }
        },
        {
            "The chart milestone dropdown lists $count milestones": (assert) => async function (count) {
                await click(`${CHART_FIELD} .ember-power-select-trigger`);
                assert.equal(document.querySelectorAll('.ember-power-select-option').length, Number(count));
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
