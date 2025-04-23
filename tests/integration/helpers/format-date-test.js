import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../stub-services/current-user-stub';

module('Integration | Helper | format-date', function (hooks) {
	setupRenderingTest(hooks);

    hooks.beforeEach(function(assert) {
        this.owner.register('service:current-user', CurrentUserStub);
        this.set('inputDate', '2024-04-04 09:12:56.0');
    });

    test('it renders default format', async function (assert) {
        await render(hbs`{{format-date date=this.inputDate}}`);

        assert.dom(this.element).hasText('April 4th 2024, 9:12:56 am');
    });

    test('it renders custom format', async function (assert) {
        this.set('format', 'YYYY-MM-DD HH:mm:ss');
        await render(hbs`{{format-date date=this.inputDate format=this.format}}`);
        assert.dom(this.element).hasText('2024-04-04 09:12:56');
    });

    test('it renders time based on user\'s timezone', async function (assert) {
        this.set('format', 'YYYY-MM-DD HH:mm:ss');
        this.set('localTime', true);
        let currentUserService = new CurrentUserStub();
        let timezone = currentUserService.user.timezone;
        await render(hbs`{{format-date date=this.inputDate format=this.format localTime=this.localTime}}`);
        let expectedLocalTime = moment.utc(this.inputDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
        assert.dom(this.element).hasText(expectedLocalTime);
    });
});
