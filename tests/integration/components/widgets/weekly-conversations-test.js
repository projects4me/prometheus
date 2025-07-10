import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';

module(
	'Integration | Component | widgets/weekly-conversations',
	function (hooks) {
		setupRenderingTest(hooks);
        hooks.beforeEach(function () {
            this.owner.register('service:currentUser', CurrentUserStub);
        });

		// Just care about the rendering of the component. The other testing
		// should be done in the acceptance tests.
		test('it renders', async function (assert) {
			await render(hbs`<Widgets::WeeklyConversations @data={{this.data}} />`);
			assert.dom('[data-recent-conversations]').exists();
		});
	}
);
