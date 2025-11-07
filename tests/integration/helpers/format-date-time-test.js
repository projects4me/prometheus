import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../stub-services/current-user-stub';

module('Integration | Helper | format-date-time', function (hooks) {
	setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        this.owner.register('service:current-user', CurrentUserStub);
        this.set('inputDate', '2024-04-04T09:12:56.000Z');
    });

    test('it renders default format', async function (assert) {
        await render(hbs`{{format-date-time date=this.inputDate}}`);

        let currentUserService = new CurrentUserStub();
        let timezone = currentUserService.user.timezone;
        let expectedDate = moment.utc(this.inputDate).tz(timezone).format("DD MMM 'YY, h:mm a");
        assert.dom(this.element).hasText(expectedDate);
    });

    test('it renders custom format', async function (assert) {
        this.set('format', 'YYYY-MM-DD HH:mm:ss');
        await render(hbs`{{format-date-time date=this.inputDate format=this.format}}`);
        
        let currentUserService = new CurrentUserStub();
        let timezone = currentUserService.user.timezone;
        let expectedDate = moment.utc(this.inputDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
        assert.dom(this.element).hasText(expectedDate);
    });

    test('it renders humanized format when humanize is true', async function (assert) {
        // Use a date that's a few days ago for reliable humanized output
        let pastDate = moment().subtract(2, 'days').utc().toISOString();
        this.set('inputDate', pastDate);
        this.set('humanize', true);
        
        await render(hbs`{{format-date-time date=this.inputDate humanize=this.humanize}}`);
        
        // Humanized format should contain "ago" or "days"
        let text = this.element.textContent.trim();
        assert.ok(text.includes('ago') || text.includes('day'), 'Should contain humanized time');
    });

    test('it converts UTC time to user timezone', async function (assert) {
        this.set('format', 'YYYY-MM-DD HH:mm:ss');
        await render(hbs`{{format-date-time date=this.inputDate format=this.format}}`);
        
        let currentUserService = new CurrentUserStub();
        let timezone = currentUserService.user.timezone;
        let expectedDate = moment.utc(this.inputDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
        assert.dom(this.element).hasText(expectedDate);
    });

    test('it returns empty string when date is undefined', async function (assert) {
        this.set('inputDate', undefined);
        await render(hbs`{{format-date-time date=this.inputDate}}`);
        assert.dom(this.element).hasText('');
    });

    test('it handles Date object', async function (assert) {
        let dateObj = new Date('2024-04-04T09:12:56.000Z');
        this.set('inputDate', dateObj);
        this.set('format', 'YYYY-MM-DD HH:mm:ss');
        
        await render(hbs`{{format-date-time date=this.inputDate format=this.format}}`);
        
        let currentUserService = new CurrentUserStub();
        let timezone = currentUserService.user.timezone;
        let expectedDate = moment.utc(dateObj).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
        assert.dom(this.element).hasText(expectedDate);
    });
});
