import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert).
        when('User clicks on issue $issueIndex from issues list', async function (issueIndex) {
            let issue = server.schema.issues.find(parseInt(issueIndex));
            let row = document.querySelector(`tr.issue[data-issue-id="${issue.id}"]`);
            assert.ok(row, `Row for issue ${issueIndex} should exist`);
            
            let link = row.querySelector('a[data-field="issue.number"]');
            assert.ok(link, `Link for issue ${issueIndex} should exist in row`);
            await click(link);
            assert.ok(true, `User clicks on issue ${issueIndex} from issues list`);
        }).
        then('The sidepanel should be rendered', async function () {
            assert.dom('div.issue-details-container').exists('Sidepanel container should exist');
            assert.dom('div.issue-details-container .box').exists('Issue details box should exist');
            assert.dom('div.col-md-8').exists('List should be in col-md-8 when sidepanel is open');
            assert.dom('div.col-md-4.issue-details-container').exists('Sidepanel should be in col-md-4');
        }).
        then('User should see the issue $issueIndex details in the sidepanel', async function (issueIndex) {
            let issue = server.schema.issues.find(parseInt(issueIndex));
            let sidepanel = document.querySelector('div.issue-details-container');
            assert.ok(sidepanel, 'Sidepanel should exist');
            let titleElement = sidepanel.querySelector('h4.issue-title, .issue-title');
            assert.ok(
                titleElement.textContent.includes(issue.subject),
                `Issue subject "${issue.subject}" should be in title`
            );
            assert.ok(
                sidepanel.textContent.includes(`#${issue.issueNumber}`) || 
                sidepanel.textContent.includes(issue.issueNumber.toString()),
                `Issue number #${issue.issueNumber} should be visible`
            );
        });
}

