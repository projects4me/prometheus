import { currentURL, fillIn, focus, settled, visit } from '@ember/test-helpers';
import steps from '../steps';
import { runSearch } from '../ez-search-run';

const BROWSER = '[data-conversation-browser]';
const INPUT = `${BROWSER} [data-field="ez-search-input"] input, ${BROWSER} input[data-field="ez-search-input"]`;
const LIST_RELS = 'createdBy,issue';

function texts(selector) {
    return [...document.querySelectorAll(selector)].map(node => node.textContent.trim());
}

function listRequests(ctx) {
    return (ctx.get('conversationRequests') || []).filter(request => request.rels === LIST_RELS);
}

function pageRequests(ctx) {
    return (ctx.get('conversationRequests') || []).filter(request => request.rels !== LIST_RELS);
}

export const given = function () {
    return [
        {
            "The thread $subject has $count comments": (assert) => async function (subject, count) {
                let room = server.schema.conversationrooms.findBy({ subject });
                for (let i = 0; i < Number(count); i++) {
                    server.create('comment', { relatedId: room.id, comment: `Comment ${i}` });
                }
                assert.ok(true, `${count} comments on ${subject}`);
            }
        },
        {
            "The vote thread $subject has $agree agree and $disagree disagree votes": (assert) => async function (subject, agree, disagree) {
                let room = server.create('conversationroom', { subject, roomType: 'vote', dateModified: '2026-10-01 10:00:00' });
                for (let i = 0; i < Number(agree); i++) {
                    server.create('comment', { relatedId: room.id, comment: 'I agree' });
                }
                for (let i = 0; i < Number(disagree); i++) {
                    server.create('comment', { relatedId: room.id, comment: 'I disagree' });
                }
                assert.ok(true, `votes on ${subject}`);
            }
        },
        {
            "The threads of the project are\n$table": (assert, ctx) => async function (table) {
                let milestones = {};
                let issueNumber = 100;
                table.forEach(row => {
                    let attrs = { subject: row.subject, roomType: row.roomType, dateModified: row.dateModified };
                    if (row.milestone) {
                        milestones[row.milestone] = milestones[row.milestone]
                            || server.create('milestone', { name: row.milestone });
                        attrs.issue = server.create('issue', {
                            subject: `Issue of ${row.subject}`,
                            issueNumber: String(++issueNumber),
                            milestoneId: milestones[row.milestone].id
                        });
                    }
                    server.create('conversationroom', attrs);
                });
                assert.ok(true, `${table.length} threads exist`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User opens the threads of the project": (assert, ctx) => async function () {
                let project = ctx.get('currentProject');
                await visit(`/app/project/${project.shortCode}/conversations`);
                assert.ok(true, 'User opens the threads of the project');
            }
        },
        {
            "User opens the threads of the project with the thread $subject as c_id": (assert, ctx) => async function (subject) {
                let project = ctx.get('currentProject');
                let room = server.schema.conversationrooms.findBy({ subject });
                await visit(`/app/project/${project.shortCode}/conversations?c_id=${room.id}`);
                assert.ok(true, 'User opens the old link');
            }
        },
        {
            'User searches the threads for "$text"': (assert, ctx) => async function (text) {
                ctx.set('listRequestsBefore', listRequests(ctx).length);
                ctx.set('pageRequestsBefore', pageRequests(ctx).length);
                await focus(INPUT);
                await fillIn(INPUT, text);
                await runSearch(INPUT);
                await settled();
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The thread $subject shows $count comments": (assert) => async function (subject, count) {
                let row = [...document.querySelectorAll(`${BROWSER} [data-conversation]`)].find(node => node.querySelector('[data-conversation-subject]').textContent.trim() === subject);
                assert.equal(row.querySelector('[data-conversation-comments]').textContent.trim(), String(count));
            }
        },
        {
            'The vote thread $subject shows "$text"': (assert) => async function (subject, text) {
                let row = [...document.querySelectorAll(`${BROWSER} [data-conversation]`)].find(node => node.querySelector('[data-conversation-subject]').textContent.trim() === subject);
                assert.equal(row.querySelector('[data-conversation-votes]').textContent.trim(), text);
            }
        },
        {
            "The thread $subject is open": (assert) => async function (subject) {
                assert.dom(`${BROWSER} .quick-list-item--active [data-conversation-subject]`).hasText(subject);
                assert.ok(/\/conversations\/[^/?]+/.test(currentURL()), `the url is a thread page: ${currentURL()}`);
                assert.dom('[data-conversation-opened] .conversation-item .subject').includesText(subject);
            }
        },
        {
            "The thread list groups are $names": (assert) => async function (names) {
                assert.deepEqual(texts(`${BROWSER} [data-test-quick-list-group-label]`), names.split(',').map(name => name.trim()));
            }
        },
        {
            "The thread list rows are $names": (assert) => async function (names) {
                assert.deepEqual(texts(`${BROWSER} [data-conversation-subject]`), names.split(',').map(name => name.trim()));
            }
        },
        {
            "The thread url has no c_id": (assert) => async function () {
                assert.notOk(currentURL().includes('c_id'), `the url is ${currentURL()}`);
            }
        },
        {
            "Only the thread list was requested again": (assert, ctx) => async function () {
                assert.ok(listRequests(ctx).length > ctx.get('listRequestsBefore'), 'the list was requested again');
                assert.equal(pageRequests(ctx).length, ctx.get('pageRequestsBefore'), 'the open thread was not loaded again');
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
