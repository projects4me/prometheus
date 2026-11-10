import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | conversation/linked-issue-box', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the translated status label of the linked issue', async function (assert) {
        this.set('issue', { issueNumber: 7, projectShortcode: 'aprom', subject: 'Fix it', status: 'in_progress' });
        await render(hbs`<Conversation::LinkedIssueBox @issue={{this.issue}} />`);
        assert.dom('[data-linked-issue-status]').hasText('In Progress');
        assert.dom('[data-linked-issue-status]').hasClass('in_progress');
    });
});
