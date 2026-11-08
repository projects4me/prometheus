import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EventLog from 'prometheus/utils/developer/event-log';

module('Integration | Component | developer/event-log', function (hooks) {
	setupRenderingTest(hooks);

	test('it shows the empty state, events and clears', async function (assert) {
		const log = new EventLog();
		this.set('log', log);
		await render(hbs`<Developer::EventLog @log={{this.log}} />`);
		assert.dom('[data-event-log-empty]').hasText('No events yet');

		log.log('change', { a: 1 });
		await settled();
		assert.dom('[data-event-log-row]').exists({ count: 1 });
		assert.dom('[data-event-log-row]').includesText('change');
		assert.dom('[data-event-log-row]').includesText('{"a":1}');

		await click('[data-event-log-clear]');
		assert.dom('[data-event-log-empty]').exists();
	});

	test('it shows at most 50 rows', async function (assert) {
		const log = new EventLog();
		for (let i = 0; i < 60; i++) {
			log.log('e' + i);
		}
		this.set('log', log);
		await render(hbs`<Developer::EventLog @log={{this.log}} />`);
		assert.dom('[data-event-log-row]').exists({ count: 50 });
	});
});
