import steps from '../steps';
import Collection from 'ember-cli-mirage/orm/collection';

export const given = function () {
    return [
        {
            "Project $projectId has $milestoneCount milestones": (assert, ctx) => async function (projectId, milestoneCount) {
                let project = server.create('project');
                project.id = projectId;
                let milestones = server.createList('milestone', parseInt(milestoneCount));
                ctx.set('milestones', milestones);
                ctx.set('project', project);
                project.update({
                    milestones: milestones
                })
                assert.equal(project.milestoneIds.length, milestoneCount, `Project ${projectId} has ${milestoneCount} milestones`);
            }
        },
        {
            "Each milestone has $issuesCount issues and there status are\n$table": (assert, ctx) => async function (issuesCount, table) {
                let statuses = _getStatuses(table[0]);
                let milestones = ctx.get('milestones');

                milestones.forEach((milestone) => {
                    let issues = _getIssues(issuesCount, statuses, ctx.get('project'), milestone)

                    /** Linking milestone with issues */
                    milestone.update({
                        issues: issues
                    });

                    assert.equal(milestone.issues.length, issuesCount, `milestone ${milestone.id} has ${issuesCount} issues`);
                });
            }
        },
        {
            "backlog has $issuesCount issues\n$table": (assert, ctx) => async function (issuesCount, table) {
                let statuses = _getStatuses(table[0]);
                server["customIssues"] = () => {
                    let issueCollection = new Collection('issue');
                    let issues = _getIssues(issuesCount, statuses, ctx.get('project'), null)
                    issueCollection.models = issues;
                    return issueCollection;
                }
            }
        }
    ];
}

function _getStatuses(statusArray) {
    let statuses = [];
    for (const [status, count] of Object.entries(statusArray)) {
        for (let i = 0; i < count; i++) {
            statuses.push(status);
        }
    }
    return statuses;
}

function _getIssues(issuesCount, statuses, project, milestone) {
    let issues = server.createList('issue', parseInt(issuesCount));
    let i = 0;
    issues.forEach((issue) => {
        issue.update({
            project: project,
            status: statuses[i],
        });
        i++;
    });
    return issues;
}

export default function (assert) {
    return steps(assert)
}