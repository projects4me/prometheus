import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | status-style', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        let store = this.owner.lookup('service:store');
        store.push({
            data: [
                { id: '1', type: 'issuestatus', attributes: { name: 'wont_fix', color: '#123456', sortOrder: 9 } },
                { id: '2', type: 'issuestatus', attributes: { name: 'uncoloured', color: null, sortOrder: 10 } }
            ]
        });
    });

    test('it paints the label with the colour of the status', async function (assert) {
        await render(hbs`<span class="badge wont_fix" style={{status-style "wont_fix"}}>x</span>`);

        assert.dom('span.badge').hasStyle({ 'background-color': 'rgb(18, 52, 86)' });
    });

    test('it can paint another property', async function (assert) {
        await render(hbs`<div style={{status-style "wont_fix" "border-top-color"}}></div>`);

        assert.dom('div').hasStyle({ 'border-top-color': 'rgb(18, 52, 86)' });
    });

    test('it leaves the label to the CSS class when the status has no colour', async function (assert) {
        await render(hbs`<span class="badge" style={{status-style "uncoloured"}}>x</span><span class="badge2" style={{status-style "unknown"}}>y</span>`);

        assert.dom('span.badge').hasAttribute('style', '');
        assert.dom('span.badge2').hasAttribute('style', '');
    });
});
