import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | milestone-blocks/completed', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestone = {
            name: "Beta",
            status: "completed"
        }

        this.set('milestone', milestone);

        await render(hbs`
            <MilestoneBlocks::Completed
                @milestone={{this.milestone}}
            />
        `);

        assert.dom('i.fa.fa-check').exists();
        assert.dom("[data-milestone-status='completed']").exists();
    });
});
