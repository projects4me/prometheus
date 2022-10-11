import steps from '../steps';

export const then = function () {
    return [
        {
            "All issues are present inside latest issue section": (assert) => async function () {
                let latestIssues = server.schema.userlatestissues.all();
                latestIssues.models.forEach((latestIssue) => {
                    assert.dom(`[data-issue="${latestIssue.subject}"]`).exists();
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}