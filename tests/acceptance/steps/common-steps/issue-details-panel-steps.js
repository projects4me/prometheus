/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

/**
 * Common step definitions for the issue details panel divider.
 * These steps are shared between the Task Board and the Issue List collapse features.
 *
 * @module tests/acceptance/steps/common-steps/issue-details-panel-steps
 */

export const when = function () {
    return [
        {
            'User clicks the panel divider handle': (assert) => async function () {
                let divider = document.querySelector('.board-panel-divider');
                assert.ok(divider, 'Panel divider handle should exist before clicking');
                await click(divider);
            }
        },
        {
            'User clicks the panel divider handle to expand': (assert) => async function () {
                let divider = document.querySelector('.board-panel-divider');
                assert.ok(divider, 'Panel divider handle should exist before expanding');
                await click(divider);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            'User should see the panel divider handle': (assert) => function () {
                let divider = document.querySelector('.board-panel-divider');
                assert.ok(divider, 'Panel divider handle should be visible');
            }
        },
        {
            'User should not see the panel divider handle': (assert) => function () {
                let divider = document.querySelector('.board-panel-divider');
                assert.notOk(divider, 'Panel divider handle should not be visible');
            }
        },
        {
            'The issue details panel should be in full width mode': (assert) => function () {
                let panel = document.querySelector('.col-md-12.issue-details-container');
                assert.ok(panel, 'Issue details panel should have col-md-12 class for full width');
            }
        },
        {
            'The issue details panel should be in default width mode': (assert) => function () {
                let panel = document.querySelector('.col-md-4.issue-details-container');
                assert.ok(panel, 'Issue details panel should have col-md-4 class for default width');
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
