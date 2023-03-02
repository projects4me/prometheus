import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | milestone-blocks/index', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestone = {
            name: "Beta"
        }

        this.set('milestone', milestone);
        debugger;
        await render(hbs`
            <MilestoneBlocks::Index
                @milestone={{this.milestone}}
            />
        `);

        assert.dom('i.fa.fa-bullseye').exists();
    });
});
