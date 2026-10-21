import { click, currentURL, visit } from '@ember/test-helpers';
import steps from '../steps';

const BROWSER = '[data-idea-browser]';

function findIdea(title) {
    return [...document.querySelectorAll(`${BROWSER} li[data-idea]`)]
        .find(item => item.querySelector('[data-idea-title]').textContent.trim() === title);
}

function listedTitles() {
    return [...document.querySelectorAll(`${BROWSER} li[data-idea] [data-idea-title]`)]
        .map(title => title.textContent.trim());
}

export const given = function () {
    return [
        {
            "The ideas of the project are\n$table": (assert, ctx) => async function (table) {
                let project = ctx.get('currentProject');
                table.forEach(row => {
                    server.create('idea', {
                        projectId: project.id,
                        title: row.title,
                        status: row.status,
                        dateModified: row.dateModified
                    });
                });
                assert.ok(true, `${table.length} ideas exist`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User opens the ideas of the project": (assert, ctx) => async function () {
                let project = ctx.get('currentProject');
                await visit(`/app/project/${project.shortCode}/idea`);
                assert.ok(true, 'User opens the ideas of the project');
            }
        },
        {
            "User clicks the archived footer link": (assert) => async function () {
                await click(`${BROWSER} [data-toggle-archived]`);
                assert.ok(true, 'User clicks the archived footer link');
            }
        },
        {
            "User selects the idea $title in the browser": (assert) => async function (title) {
                await click(findIdea(title).querySelector('a'));
                assert.ok(true, `User selects the idea ${title}`);
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The sidebar shows the Idea entry": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Idea"]').exists();
            }
        },
        {
            "The sidebar does not show the Idea entry": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Idea"]').doesNotExist();
            }
        },
        {
            "The idea browser lists the ideas $titles": (assert) => async function (titles) {
                assert.deepEqual(listedTitles(), titles.split(',').map(title => title.trim()));
            }
        },
        {
            "The idea $title is labelled $label": (assert) => async function (title, label) {
                assert.equal(findIdea(title).querySelector('[data-idea-status]').textContent.trim(), label);
            }
        },
        {
            "The idea $title is highlighted in the browser": (assert) => async function (title) {
                assert.dom(`${BROWSER} li.active`).exists({ count: 1 });
                assert.ok(findIdea(title).classList.contains('active'), `${title} is highlighted`);
            }
        },
        {
            "The archived footer link reads $text": (assert) => async function (text) {
                assert.dom(`${BROWSER} [data-toggle-archived]`).hasText(text);
            }
        },
        {
            "The empty idea box is shown": (assert) => async function () {
                assert.dom('[data-idea-empty]').exists();
                assert.ok(document.querySelector('.idea-wrapper .col-md-9 [data-idea-empty]'), 'it fills the col-md-9');
            }
        },
        {
            "The idea page columns are shown": (assert) => async function () {
                assert.ok(/\/idea\/\d+$/.test(currentURL()), `on an idea page: ${currentURL()}`);
                assert.dom('.idea-page .col-md-8[data-idea-main]').exists();
                assert.dom('.idea-page .col-md-4[data-idea-side]').exists();
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
