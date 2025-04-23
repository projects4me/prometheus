import steps from '../steps';

export const then = function() {
    return [
        {
            "all issues in the list should have status $status": (assert) => async function(status) {
                const issueStatusCells = document.querySelectorAll('[data-field="issue.status"]');
                
                assert.ok(issueStatusCells.length > 0, 'Issues are present in the list');
                
                for (let i = 0; i < issueStatusCells.length; i++) {
                    assert.equal(
                        issueStatusCells[i].textContent.trim(), 
                        status, 
                        `Issue ${i+1} has correct status: ${status}`
                    );
                }
            }
        },
        {
            "all issues in the list should have priority $priority": (assert) => async function(priority) {
                const issuePriorityCells = document.querySelectorAll('[data-field="issue.priority"]');
                
                assert.ok(issuePriorityCells.length > 0, 'Issues are present in the list');
                for (let i = 0; i < issuePriorityCells.length; i++) {
                    assert.ok(
                        issuePriorityCells[i].dataset.priority === priority.toLowerCase(),
                        `Issue ${i+1} has correct priority: ${priority}`
                    );
                }
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
