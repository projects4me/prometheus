import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

module('Integration | Component | widgets', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders', async function (assert) {
		await render(hbs`<Widgets />`);
		assert.dom('[data-widgets]').exists();
	});

	test('it renders each widget with its data and settings', async function (assert) {
		this.owner.register(
			'component:widgets/test-widget',
			setComponentTemplate(
				hbs`<p data-test-widget>{{@data.title}} {{@widgetSettings.label}} {{@currentUser.name}}</p>`,
				templateOnly()
			)
		);
		this.set('widgets', { testWidget: { title: 'Data' } });
		this.set('widgetSettings', { testWidget: { label: 'Settings' } });
		this.set('currentUser', { name: 'Ada' });

		await render(hbs`
			<Widgets @widgets={{this.widgets}} @widgetSettings={{this.widgetSettings}} @currentUser={{this.currentUser}} />
		`);

		assert.dom('.col-md-6 .widget [data-test-widget]').hasText('Data Settings Ada');
	});
});
