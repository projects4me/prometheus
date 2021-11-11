import { fillIn, currentURL, visit } from '@ember/test-helpers';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

import steps from './steps';

export const given = function () {
    return [{
        "Project $projectId has $milestoneCount milestones": (assert) => async function (projectId, milestoneCount) {
            let project = server.schema.projects.find(projectId);
            assert.equal(project.milestoneIds.length, milestoneCount, `Project ${projectId} has ${milestoneCount} milestones`);
        }
    }]
}

export const when = function () {
    return [{
        "User navigates to issue create page": (assert) => async function () {
            await visit('/app/project/3/issue/create/');
            assert.equal(currentURL(), '/app/project/3/issue/create/', `User navigates to issue create page`);
        },
    }, {
        "User enters subject": (assert) => async function () {
            let inputElement = document.querySelector('div.form-group > div[data-field="issue.subject"] > input');
            await fillIn(inputElement, "test subject");
            assert.ok(true, "User enters subject");
        }
    }, {
        "User enters description": (assert) => async function () {
            let inputElement = document.querySelector('div[data-field="issue.description"]  div.tui-editor-contents.tui-editor-contents-placeholder');
            await fillIn(inputElement, "test description");
            assert.ok(true, "User enters description");
        }
    }, {
        "User selects type": (assert) => async function () {
            await clickTrigger('div[data-field="issue.type"] > div.input-group.select-input');
            await selectChoose('div[data-field="issue.type"] > div.input-group.select-input > div', '.ember-power-select-option', 3);
            assert.ok(true, "User selects type");
        }
    }
    ]
}

export const then = function () {
    return [{
        "$userName should be $field": (assert) => async function (userName, field) {
            let assigneeElement = document.querySelector(`div[data-field="issue.${field}"] span.ember-power-select-selected-item span.username`);
            assert.equal(assigneeElement.innerText, userName, `${userName} should be ${field}`);
        }
    }]
}

export default function (assert) {
    return steps(assert);
}