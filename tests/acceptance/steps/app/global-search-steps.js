import steps from '../steps';
import { selectChoose, selectSearch, clickTrigger } from 'ember-power-select/test-support/helpers'
import { currentURL } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "there are $issuesCount issues in the application": (assert, ctx) => async function (issuesCount) {
                let issues = server.createList('issue', parseInt(issuesCount));
                let project = server.create('project');

                //Updating issue relationship with project for not getting error through data tables
                issues.forEach((issue) => {
                    issue.update({
                        projectId: project.id
                    })
                });

                ctx.set('currentProject', project);
                assert.ok(true, `there are ${issuesCount} issues in the application`);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User clicks on global search": (assert) => async function () {
                await clickTrigger('div.global-search');
                assert.ok(true, 'drop down opens up');
            }
        },
        {
            "User search for $issue": (assert, ctx) => async function (issue) {
                ctx.set('fieldSearched', 'Issue.issueSubject');
                await selectSearch('div.global-search', `${issue}`);
                assert.ok(true, `User searched for ${issue}`);
                ctx.set('fieldSearched', null);
            }
        },
        {
            "User selects $issue": (assert) => async function (issue) {
                await selectChoose('div.global-search', `${issue}`);
                assert.ok(true, `${issue} selected`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "User is navigated to Issue $issueNumber detail view": (assert, ctx) => async function (issueNumber) {
                let shortCode = ctx.get('currentProject').shortCode;
                assert.equal(currentURL(), `/app/project/${shortCode}/issue/${issueNumber}`, `user is navigated to detail view of Issue # ${issueNumber}`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}