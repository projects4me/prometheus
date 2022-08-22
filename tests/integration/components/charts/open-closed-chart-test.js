import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | charts/open-closed-chart', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders open closed component', async function (assert) {
        await render(hbs`
            <Charts::OpenClosedChart 
            />
        `);

        assert.dom('canvas').exists();
    });
});
