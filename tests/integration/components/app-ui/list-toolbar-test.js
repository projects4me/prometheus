import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/list-toolbar', function (hooks) {
	setupRenderingTest(hooks);

	test('it lays out the search and actions in the header and the selection and pager below', async function (assert) {
		await render(hbs`<AppUi::ListToolbar>
			<:search><input aria-label="Search" data-test-search /></:search>
			<:actions><button type="button" data-test-create>New</button></:actions>
			<:selection><button type="button" data-test-bulk>Delete</button></:selection>
			<:pager><span data-test-range>1-20</span></:pager>
		</AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-header] [data-test-search]').exists();
		assert.dom('[data-test-list-toolbar-header] [data-test-create]').exists();
		assert.dom('[data-test-list-toolbar] [data-test-bulk]').exists();
		assert.dom('[data-test-list-toolbar-pager] [data-test-range]').exists();
	});

	test('without search or actions there is no header, without a pager no pager slot', async function (assert) {
		await render(hbs`<AppUi::ListToolbar>
			<:selection><button type="button" data-test-bulk>Delete</button></:selection>
		</AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-header]').doesNotExist();
		assert.dom('[data-test-list-toolbar-pager]').doesNotExist();
		assert.dom('[data-test-list-toolbar] [data-test-bulk]').exists();
	});
});
