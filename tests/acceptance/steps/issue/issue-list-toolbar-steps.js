/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

/**
 * Collects title attributes from the bulk-action buttons of a list-controls toolbar,
 * excluding the pagination btn-group inside .pull-right.
 *
 * @param {Element} toolbar
 * @returns {string[]}
 */
function getBulkActionTitles(toolbar) {
    const group = toolbar.querySelector(':scope > .btn-group');
    if (!group) {
        return [];
    }
    return Array.from(group.querySelectorAll('button[data-toggle="tooltip"]'))
        .map((button) => button.getAttribute('title') || '');
}

/**
 * #UNCOMMON steps for issue-list-toolbar.feature only.
 * Do not add these to tests/acceptance/steps/steps.js — they load via
 * tests/acceptance/steps/issue/issue-list-toolbar-steps.js (ember-cli-yadda).
 *
 * @module tests/acceptance/steps/issue/issue-list-toolbar-steps
 */
export default function (assert) {
    return (
        steps(assert)
            .when('User confirms the delete action', async function () {
                let confirmBtn = document.querySelector('[data-action="confirm"] a');
                assert.ok(confirmBtn, 'Delete confirmation action exists');
                await click(confirmBtn);
                assert.ok(true, 'User confirms the delete action');
            })
            .then('top and bottom issue list toolbars have matching bulk actions', async function () {
                const toolbars = document.querySelectorAll('.issues .list-controls');
                assert.equal(toolbars.length, 2, 'Issue list has top and bottom toolbars');

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
                assert.dom('.box-body .list-controls button[data-btn="delete-issues"]').exists(
                    'Top toolbar includes Delete'
                );
                assert.dom('.box-footer .list-controls button[data-btn="delete-issues"]').exists(
                    'Bottom toolbar includes Delete'
                );
                assert.dom('.box-body .list-controls button[data-btn="mass-update-issues"]').exists(
                    'Top toolbar includes Mass Update'
                );
                assert.dom('.box-footer .list-controls button[data-btn="mass-update-issues"]').exists(
                    'Bottom toolbar includes Mass Update'
                );
            })
            .then('issue list toolbars do not include share, discuss or refresh', async function () {
                const toolbars = document.querySelectorAll('.issues .list-controls');
                toolbars.forEach((toolbar, index) => {
                    const titles = Array.from(toolbar.querySelectorAll('button[data-toggle="tooltip"]'))
                        .map((button) => button.getAttribute('title') || '');
                    ['Share', 'Discuss', 'Refresh'].forEach((title) => {
                        assert.notOk(
                            titles.includes(title),
                            `Toolbar ${index + 1} does not include ${title}`
                        );
                    });
                });
            })
            .then('the issues list should be empty', async function () {
                assert.equal(
                    server.schema.issues.all().length,
                    0,
                    'All selected issues were deleted'
                );
                assert.dom('.issues table tbody tr[data-issue-id]').doesNotExist(
                    'No issue rows remain in the list'
                );
            })
    );
}
