import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
	return steps(assert).
    when('User clicks on conversation $conversationIndex from latest conversations section', async function (conversationIndex) {
        let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
        await click(`[data-conversation-id="${conversation.id}"] a`);
        assert.ok(true, `User clicks on conversation ${conversationIndex} from latest conversations section`);
    }).
    then('User should see the conversation $conversationIndex in the sidepanel', function (conversationIndex) {
        let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
        assert.dom(`div.conversation-opened-container .conversation-item .subject a`).hasText(conversation.subject);
    });
}
