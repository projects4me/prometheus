import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | moment-format', function (hooks) {
	setupRenderingTest(hooks);

	test('it formats a date', async function (assert) {
		this.set('inputDate', '2024-04-04 09:12:56');
		await render(hbs`{{moment-format this.inputDate 'DD MMM YYYY'}}`);
		assert.dom(this.element).hasText('04 Apr 2024');
	});

	test('it renders a dash for an empty date', async function (assert) {
		for (const empty of [undefined, null, '']) {
			this.set('inputDate', empty);
			await render(hbs`{{moment-format this.inputDate 'DD MMM YYYY'}}`);
			assert.dom(this.element).hasText('-');
		}
	});
});
