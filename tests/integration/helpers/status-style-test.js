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
                { id: '2', type: 'issuestatus', attributes: { name: 'uncoloured', color: null, sortOrder: 10 } },
                { id: '3', type: 'issuestatus', attributes: { name: 'waiting', color: '#fff3a0', sortOrder: 11 } },
                { id: '4', type: 'issuestatus', attributes: { name: 'blocked', color: '#fff3a0', textColor: 'light', sortOrder: 12 } }
            ]
        });
    });

    test('it paints the label with the colour of the status', async function (assert) {
        await render(hbs`<span class="badge wont_fix" style={{status-style "wont_fix"}}>x</span>`);

        assert.dom('span.badge').hasStyle({ 'background-color': 'rgb(18, 52, 86)' });
    });

    test('it picks a readable text colour for the background', async function (assert) {
        await render(hbs`<span class="badge dark" style={{status-style "wont_fix"}}>x</span><span class="badge light" style={{status-style "waiting"}}>y</span>`);

        assert.dom('span.dark').hasStyle({ color: 'rgb(255, 255, 255)' });
        assert.dom('span.light').hasStyle({ color: 'rgb(0, 0, 0)' });
    });

    test('it uses the text colour chosen for the status', async function (assert) {
        await render(hbs`<span class="badge" style={{status-style "blocked"}}>x</span>`);

        assert.dom('span.badge').hasStyle({ color: 'rgb(255, 255, 255)' });
    });

    test('it leaves the text colour alone when it paints another property', async function (assert) {
        await render(hbs`<div style={{status-style "waiting" "border-top-color"}}></div>`);

        assert.notOk(this.element.querySelector('div').getAttribute('style').includes('; color'));
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
