/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/gantt-chart/link-type-picker', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.source = { issueNumber: 12 };
		this.target = { issueNumber: 34 };
		this.chosen = [];
		this.cancelled = 0;
		this.onSelect = (relation) => this.chosen.push(relation);
		this.onCancel = () => this.cancelled++;
	});

	const picker = hbs`<AppUi::GanttChart::LinkTypePicker @source={{this.source}} @target={{this.target}} @x={{10}} @y={{20}}
		@onSelect={{this.onSelect}} @onCancel={{this.onCancel}} />`;

	test('it shows the title and the three options, the first focused', async function (assert) {
		await render(picker);

		assert.dom('[data-test-link-picker-title]').hasText('Link #12 to #34');
		assert.dom('[data-test-link-picker-option]').exists({ count: 3 });
		assert.dom('[data-test-link-picker-option="blocks"]').hasText('#12 blocks #34');
		assert.dom('[data-test-link-picker-option="splitsInto"]').hasText('#12 splits into #34');
		assert.dom('[data-test-link-picker-option="relates"]').hasText('#12 relates to #34');
		assert.dom('[data-test-link-picker-option="blocks"] input').isFocused();
	});

	test('choosing an option reports its relation', async function (assert) {
		await render(picker);
		await click('[data-test-link-picker-option="splitsInto"] input');

		assert.deepEqual(this.chosen, ['splitsInto']);
	});

	test('Esc and an outside click cancel', async function (assert) {
		await render(picker);
		await triggerKeyEvent(document, 'keydown', 'Escape');
		await click(document.body);

		assert.strictEqual(this.cancelled, 2);
		assert.deepEqual(this.chosen, []);
	});
});
