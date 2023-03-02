import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | milestone-blocks/deferred', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestone = {
            name: "Beta",
            status: "deferred"
        }

        this.set('milestone', milestone);

        await render(hbs`
            <MilestoneBlocks::Deferred
                @milestone={{this.milestone}}
            />
        `);

        assert.dom('i.fa.fa-circle-o-notch').exists();
        assert.dom("[data-milestone-status='deferred']").exists();
    });
});
