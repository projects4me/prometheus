import { fillIn, currentURL, visit, click } from '@ember/test-helpers';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { pluralize } from 'ember-inflector';
import steps from '../steps';

export const given = function () {
    return [
        {
            "$userName selects Project $projectId": (assert, ctx) => async function (userName, projectId) {
                let project = server.create('project');
                let oldProjectId = project.id;
                let users = server.schema.users.all().models;
                if (projectId !== '1') {
                    project.update({
                        id: projectId,
                        members: users
                    });
                    server.db.projects.remove(oldProjectId);
                }
                ctx.set('currentProject', project);
                assert.equal(project.id, projectId);
            }
        },
        {
            "Project $projectId has following details\n$table": (assert, ctx) => async function (projectId, table) {
                let project = ctx.get('currentProject');
                _setProject(table[0], project);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User navigates to issue create page": (assert, ctx) => async function () {
                let currentProject = ctx.get('currentProject');
                await visit(`/app/project/${currentProject.id}/issue/create/`);
                assert.equal(currentURL(), `/app/project/${currentProject.id}/issue/create/`, `User navigates to issue create page`);
            },
        },
        {
            "User enters $content in subject": (assert) => async function (content) {
                let inputElement = document.querySelector('div.form-group > div[data-field="issue.subject"] > input');
                await fillIn(inputElement, content);
                assert.ok(true, "User enters subject");
            }
        },
        {
            "User enters $content in description": (assert) => async function (content) {
                let inputElement = document.querySelector('div[data-field="issue.description"]  div.tui-editor-contents.tui-editor-contents-placeholder');
                await fillIn(inputElement, content);
                assert.ok(true, "User enters description");
            }
        },
        {
            "User selects option $id of $module $field": (assert) => async function (id, module, field) {
                let selectEl = document.querySelector(`div[data-field="${module}.${field}"] > div.input-group`);
                await selectChoose(selectEl.querySelector('div'), '.ember-power-select-option', id - 1);
                assert.ok(true, "User selects type");
            }
        },
        {
            "User selects option $id from milestone": (assert) => async function (id) {
                await clickTrigger('div[data-field="issue.milestone"] > div.input-group.select-input');
                await selectChoose('div[data-field="issue.milestone"] > div.input-group.select-input > div', '.ember-power-select-option', id); //not subtracted by 1 because it has it default value
                assert.ok(true, "User selects milestone");
            }
        },
        {
            "User clicks on save button": (assert) => async function () {
                let btn = document.querySelector('button[data-btn="save"]');
                await click(btn);
                assert.ok(true, "User clicks on save button");
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "$userName should be $field": (assert) => async function (userName, field) {
                let selector = `div[data-field='issue.${field}'] span.ember-power-select-selected-item span.username`;
                let assigneeElement = document.querySelector(selector);
                assert.equal(assigneeElement.innerText, userName, `${userName} should be ${field}`);
            }
        },
        {
            "User is navigated to issue detail view": (assert, ctx) => async function () {
                let currentProject = ctx.get('currentProject');
                let LatestCreatedIssue = ctx.get('latestCreatedIssue');
                assert.equal(currentURL(), `/app/project/${currentProject.id}/issue/${LatestCreatedIssue.id}`, 'url matched');
            }
        },
        {
            "Issue subject is $content": (assert) => async function (content) {
                let el = document.querySelector('div[data-field="issue.subject"] span.issueSubject');
                assert.equal(content, el.innerText, 'subject matched');
            }
        },
        {
            "Issue description is $content": (assert) => async function (content) {
                let el = document.querySelector('div[data-field="issue.description"] > p');
                assert.equal(content, el.innerText, 'description matched');
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}

function _setProject(projectDetails, project) {
    for (const [module, count] of Object.entries(projectDetails)) {
        let [relName, relatedModelName] = getRelatedModelName(module);
        let relatedModel = server.createList(relatedModelName, parseInt(count));

        project.update({
            [relName]: relatedModel
        });
    }
}

function getRelatedModelName(module) {
    let relName = '';
    let relatedModelName = '';
    let regex = /\([^)]*\)/g;

    //check if user has given relationship name as input or not
    if (regex.test(module)) {
        let splittedString = module.split('(');
        relName = splittedString[0];
        relatedModelName = splittedString[1].slice(0, -1);
    } else {
        relatedModelName = module;
        relName = pluralize(module);
    }

    return [relName, relatedModelName];
}