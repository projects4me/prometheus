import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | milestone-blocks/failed', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestone = {
            name: "Beta",
            status: "failed"
        }

        this.set('milestone', milestone);

        await render(hbs`
            <MilestoneBlocks::Failed
                @milestone={{this.milestone}}
            />
        `);

        assert.dom('i.fa.fa-times').exists();
        assert.dom("[data-milestone-status='failed']").exists();
    });
});
