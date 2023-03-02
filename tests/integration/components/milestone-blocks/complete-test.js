import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | milestone-blocks/complete', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestone = {
            name: "Beta",
            status: "complete"
        }

        this.set('milestone', milestone);

        await render(hbs`
            <MilestoneBlocks::Complete
                @milestone={{this.milestone}}
            />
        `);

        assert.dom('i.fa.fa-check').exists();
        assert.dom("[data-milestone-status='complete']").exists();
    });
});
