import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/issue/mentioned', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "01 month",
            createdUserName: "Rana Nouman",
            type: "mentioned",
            relatedTo: "issue",
            description: "issue#456 was mentioned"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Issue::Mentioned
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-at');
        assert.dom('[data-activity="dateCreated"]').hasText('01 month ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman mentioned the Issue`);
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});
