/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, find } from '@ember/test-helpers';
import steps from '../../steps';

const WIDGET_SELECTOR = '[data-recent-issues-table]';
const REFRESH_BTN_SELECTOR = `${WIDGET_SELECTOR} [data-refresh-button]`;

export default function (assert) {
    return steps(assert)
        .when('A new issue is added to the server', async function () {
            let project = server.schema.projects.find(2);
            server.create('issue', {
                issueNumber: 11,
                subject: 'Test Issue 11',
                description: 'Test Description 11',
                status: 'Open',
                issueTypeId: 1,
                projectId: project.id,
                projectShortcode: project.shortCode,
                startDate: '2026-03-12',
                endDate: '2026-03-12'
            });
            assert.ok(true, 'A new issue is added to the server');
        })
        .when('User clicks on refresh button in recent issues widget', async function () {
            const refreshBtn = find(REFRESH_BTN_SELECTOR);
            if (refreshBtn) {
                await click(refreshBtn);
                assert.ok(true, 'User clicked on refresh button in recent issues widget');
            } else {
                assert.ok(false, 'Refresh button not found in recent issues widget');
            }
        })
        .then('Refresh button should be visible in recent issues widget', async function () {
            assert
                .dom(REFRESH_BTN_SELECTOR)
                .exists('Refresh button should be visible in the Recent Issues widget header');
        });
}
