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
    );
}
