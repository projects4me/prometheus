import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/accordion', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders and toggles the sections', async function (assert) {
		let sections = {
			section1: 'content1',
			section2: 'content2'
		};
		this.set('sections', sections);
		await render(hbs`<AppUi::Accordion @sections={{this.sections}} />`);
		const sectionKeys = Object.keys(sections);
		for (let i = 0; i < sectionKeys.length; i++) {
			let section = sectionKeys[i];
			let sectionElement = this.element.querySelector(
				`[data-accordion-section="${section}"]`
			);
			assert.dom(sectionElement).exists();
			await click(`[data-accordion-toggle-section="${section}"]`);
			assert.dom(sectionElement).hasClass('open');
			assert
				.dom(sectionElement.querySelector('.accordion-body'))
				.exists();
			assert
				.dom(sectionElement.querySelector('.accordion-body'))
				.hasText(sections[section]);
		}
	});
});
