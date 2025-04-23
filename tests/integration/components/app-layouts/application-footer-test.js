import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
	'Integration | Component | app-layouts/application-footer',
	function (hooks) {
		setupRenderingTest(hooks);

		test('it renders footer with year, dynamically for copyright', async function (assert) {
			await render(hbs`<AppLayouts::ApplicationFooter />`);
			let currentYear = new Date().getFullYear();

			assert
				.dom('[data-footer="copyright"]')
				.hasText(`Copyright © ${currentYear} Projects4Me Inc..`);
		});
	}
);
