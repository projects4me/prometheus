import { click, fillIn } from '@ember/test-helpers';
import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';
import Collection from 'ember-cli-mirage/orm/collection';

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
            .when('User sets custom callback for conversation to return $count conversations', async function (count) {
                let ctx = new Context();
                ctx.set('cbConversationRoom', function () {
                    let conversation = server.schema.conversationrooms.find(parseInt(count, 10));
                    if (conversation) {
                        return new Collection('conversationroom', [conversation]);
                    }
                    return new Collection('conversationroom', []);
                });
            })
            .when('User enters $text in conversation search', async function (text) {
                let searchInput = document.querySelector('#conversation-search');
                await fillIn(searchInput, text);
                assert.ok(true, `User enters ${text} in conversation search`);
            })
            .when('User selects $filterName from conversation filter dropdown', async function (filterName) {
                let filterOption = document.querySelector(`[data-filter-name=${filterName}]`);
                await click(filterOption);
                assert.ok(true, `User selects ${filterName} from conversation filter dropdown`);
            })
            .when('User selects $dateFilterName from conversation date dropdown', async function (dateFilterName) {
                let dateOption = document.querySelector(`[data-date-filter-name=${dateFilterName}]`);
                await click(dateOption);
                assert.ok(true, `User selects ${dateFilterName} from conversation date dropdown`);
            })
            .when('User clicks conversation search button', async function () {
                let searchBtn = document.querySelector('[data-btn="search"]');
                await click(searchBtn);
                assert.ok(true, 'User clicks conversation search button');
            })
            .then('conversation search filters are applied', async function () {
                let clearBtn = document.querySelector('[data-btn="clearSearch"]');
                assert.dom(clearBtn).isNotDisabled('Clear button is enabled when search is applied');
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
            .then('There should be $count conversations in the list', async function (count) {
                let conversations = document.querySelectorAll('.conversation-item');
                assert.equal(conversations.length - 1, count, 'There should be ' + count + ' conversations in the list');
            })
            .then('No conversations found message is displayed', async function () {
                let noContentEl = document.querySelector('.no-content');
                assert.dom(noContentEl).exists();
            })
    );
}
