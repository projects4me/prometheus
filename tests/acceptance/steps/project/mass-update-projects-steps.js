import steps from '../steps';
import { click } from '@ember/test-helpers';

/**
 * Returns the bulk-action button group from a list-controls toolbar,
 * excluding the pagination btn-group inside .pull-right.
 *
 * @param {Element} toolbar
 * @returns {Element|null}
 */
function getBulkActionGroup(toolbar) {
    return toolbar.querySelector(':scope > .btn-group');
}

/**
 * Collects title attributes from bulk action buttons in a toolbar.
 *
 * @param {Element} toolbar
 * @returns {string[]}
 */
function getBulkActionTitles(toolbar) {
    const group = getBulkActionGroup(toolbar);
    if (!group) {
        return [];
    }
    return Array.from(group.querySelectorAll('button[data-toggle="tooltip"]'))
        .map((button) => button.getAttribute('title') || '');
}

export default function (assert) {
    return (
        steps(assert)
            .when('User confirms the delete action', async function () {
                let confirmBtn = document.querySelector('[data-action="confirm"] a');
                assert.ok(confirmBtn, 'Delete confirmation action exists');
                await click(confirmBtn);
                assert.ok(true, 'User confirms the delete action');
            })
            .then('top and bottom project list toolbars have matching bulk actions', async function () {
                const toolbars = document.querySelectorAll('.projects.project .list-controls');
                assert.equal(toolbars.length, 2, 'Projects list has top and bottom toolbars');

                const topTitles = getBulkActionTitles(toolbars[0]);
                const bottomTitles = getBulkActionTitles(toolbars[1]);

                assert.deepEqual(
                    topTitles,
                    ['Delete', 'Mass Update', 'Export'],
                    'Top toolbar bulk actions are Delete, Mass Update, Export'
                );
                assert.deepEqual(
                    bottomTitles,
                    topTitles,
                    'Bottom toolbar bulk actions match the top toolbar'
                );
                assert.dom('.box-body .list-controls button[data-btn="mass-update-projects"]').exists(
                    'Top toolbar includes Mass Edit'
                );
                assert.dom('.box-footer .list-controls button[data-btn="mass-update-projects"]').exists(
                    'Bottom toolbar includes Mass Edit'
                );
                assert.dom('.box-body .list-controls button[data-btn="delete-projects"]').exists(
                    'Top toolbar includes Delete'
                );
                assert.dom('.box-footer .list-controls button[data-btn="delete-projects"]').exists(
                    'Bottom toolbar includes Delete'
                );
            })
            .then('project list toolbars do not include discuss or refresh', async function () {
                const toolbars = document.querySelectorAll('.projects.project .list-controls');
                toolbars.forEach((toolbar, index) => {
                    const titles = Array.from(toolbar.querySelectorAll('button[data-toggle="tooltip"]'))
                        .map((button) => button.getAttribute('title') || '');
                    assert.notOk(
                        titles.includes('Discuss'),
                        `Toolbar ${index + 1} does not include Discuss`
                    );
                    assert.notOk(
                        titles.includes('Refresh'),
                        `Toolbar ${index + 1} does not include Refresh`
                    );
                });
            })
            .then('all projects in the list should have status $status', async function (status) {
                const statusCells = document.querySelectorAll('.projects.project table tbody td.project-status');

                assert.ok(statusCells.length > 0, 'Projects are present in the list');

                for (let i = 0; i < statusCells.length; i++) {
                    assert.equal(
                        statusCells[i].textContent.trim(),
                        status,
                        `Project ${i + 1} has correct status: ${status}`
                    );
                }
            })
            .then('the projects list should be empty', async function () {
                assert.equal(
                    server.schema.projects.all().length,
                    0,
                    'All selected projects were deleted'
                );
                assert.dom('.projects.project table tbody tr[data-project-id]').doesNotExist(
                    'No project rows remain in the list'
                );
            })
    );
}
