import steps from '../steps';

export default function (assert) {
    return (
        steps(assert)
            .given('conversation $convId is linked with issue $issueNumber', async function (convId, issueNumber) {
                let conversation = server.schema.conversationrooms.find(parseInt(convId, 10));
                let issue = server.create('issue', {
                    issueNumber: String(issueNumber),
                    projectId: conversation.projectId,
                    projectShortcode: 'PROJECT_1',
                    subject: `Issue ${issueNumber} subject`,
                    status: 'new',
                    priority: 'medium'
                });
                conversation.update({
                    issueId: issue.id,
                    issueNumber: issue.issueNumber,
                    issue: issue
                });

                assert.ok(true, `Linked conversation ${convId} with issue ${issueNumber}`);
            })
            .then('the first conversation should display linked issue badge', async function () {
                let conversationItem = document.querySelector('.conversation-item[id]');
                let badge = conversationItem && conversationItem.querySelector('.subject .conversation-issue-badge a');

                assert.ok(badge, 'Issue badge is rendered for the first conversation');
                assert.ok(badge.textContent.trim().startsWith('#'), 'Badge text starts with issue number');
                assert.ok(
                    badge.getAttribute('href').indexOf('/app/project/PROJECT_1/issue/') !== -1,
                    'Badge link points to issue page'
                );
            })
    );
}
