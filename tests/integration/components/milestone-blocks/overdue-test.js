import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | milestone-blocks/overdue', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestone = {
            name: "Beta",
            status: "overdue"
        }

        this.set('milestone', milestone);

        await render(hbs`
            <MilestoneBlocks::Overdue
                @milestone={{this.milestone}}
            />
        `);

        assert.dom('i.fa.fa-exclamation-triangle').exists();
        assert.dom("[data-milestone-status='overdue']").exists();
    });
});
