import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | widgets', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders', async function (assert) {
		await render(hbs`<Widgets />`);
		assert.dom('[data-widgets]').exists();
	});
});
