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
        },
        {
            "The plans of the idea $title are\n$table":(assert, ctx) => async function (title, table) {
                let idea = server.schema.ideas.findBy({ title });
                table.forEach(row => {
                    server.create('ideaplan', { ideaId: idea.id, version: Number(row.version), status: row.status });
                });
                assert.ok(true, `${table.length} plans exist for ${title}`);
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
            "User opens the board of the project": (assert, ctx) => async function () {
                let project = ctx.get('currentProject');
                await visit(`/app/project/${project.shortCode}/board`);
                assert.ok(true, 'User opens the board of the project');
            }
        },
        {
            "User clicks the Ideas entry in the sidebar": (assert) => async function () {
                await click('.sidebar-menu [data-navigation-module="Idea"] > a');
                assert.ok(true, 'User clicks the Ideas entry in the sidebar');
            }
        },
        {
            "User clicks the archived footer link": (assert) => async function () {
                await click(`${BROWSER} [data-toggle-archived]`);
                assert.ok(true, 'User clicks the archived footer link');
            }
        },
        {
            "User collapses the idea browser": (assert) => async function () {
                await click('[data-collapse-browser]');
                assert.ok(true, 'User collapses the idea browser');
            }
        },
        {
            "User expands the idea browser": (assert) => async function () {
                await click('[data-expand-browser]');
                assert.ok(true, 'User expands the idea browser');
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
            "The ideas page is open": (assert, ctx) => async function () {
                let project = ctx.get('currentProject');
                assert.ok(currentURL().toLowerCase().startsWith(`/app/project/${project.shortCode.toLowerCase()}/idea`), `ideas route is open: ${currentURL()}`);
            }
        },
        {
            "The Ideas sidebar entry has no submenu": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Idea"] .treeview-menu').doesNotExist();
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
            "The idea browser opens on the new idea form": (assert) => async function () {
                assert.ok(/\/idea\/create$/.test(currentURL()), `on the new idea page: ${currentURL()}`);
                assert.dom('[data-idea-main]').exists();
                assert.dom('[data-idea-empty]').doesNotExist();
                assert.dom(`${BROWSER} li`).exists();
            }
        },
        {
            "The idea browser is hidden and the idea page spans the full width": (assert) => async function () {
                assert.dom(BROWSER).doesNotExist();
                assert.dom('.idea-wrapper > .col-md-12').exists();
                assert.dom('[data-expand-browser]').exists();
            }
        },
        {
            "The idea browser is shown beside the idea page": (assert) => async function () {
                assert.dom(BROWSER).exists();
                assert.dom('.idea-wrapper > .col-md-9').exists();
                assert.dom('[data-expand-browser]').doesNotExist();
            }
        },
        {
            "The collapsed state is remembered in the browser storage as $value": (assert) => async function (value) {
                assert.equal(localStorage.getItem('ideaBrowserCollapsed'), value);
            }
        },
        {
            "The empty idea box is shown": (assert) => async function () {
                assert.dom('[data-idea-empty]').exists();
                assert.ok(document.querySelector('.idea-wrapper .col-md-9 [data-idea-empty]'), 'it fills the col-md-9');
                assert.dom('[data-idea-empty-hint]').hasClass('text-muted', 'the hint is readable');
                assert.dom('[data-idea-empty] a[href$="/idea/create"]').doesNotExist('the browser\'s New idea is the only start');
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
