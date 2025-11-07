import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | format-date', function (hooks) {
	setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        this.set('inputDate', '2024-04-04 09:12:56.0');
    });

    test('it renders default format', async function (assert) {
        await render(hbs`{{format-date date=this.inputDate}}`);

        assert.dom(this.element).hasText("04 Apr '24");
    });

    test('it renders custom format', async function (assert) {
        this.set('format', 'YYYY-MM-DD HH:mm:ss');
        await render(hbs`{{format-date date=this.inputDate format=this.format}}`);
        assert.dom(this.element).hasText('2024-04-04 09:12:56');
    });

    test('it returns empty string when date is undefined', async function (assert) {
        this.set('inputDate', undefined);
        await render(hbs`{{format-date date=this.inputDate}}`);
        assert.dom(this.element).hasText('');
    });

    test('it handles Date object', async function (assert) {
        this.set('inputDate', new Date('2024-04-04T09:12:56'));
        await render(hbs`{{format-date date=this.inputDate format="YYYY-MM-DD"}}`);
        assert.dom(this.element).hasText('2024-04-04');
    });
});
