import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { isHTMLSafe } from '@ember/template';

module('Unit | Service | intl', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.intl = this.owner.lookup('service:intl');
		this.intl.setLocale('en-us');
		this.intl.addTranslations('en-us', {
			test: {
				plain: 'Plain text',
				name: 'Hello {name}',
				plural: '{count, plural, =0 {none} =1 {one item} other {# items}}',
				offset: '{count, plural, offset:1 =0 {nobody} =1 {only you} one {you and # other} other {you and # others}}',
				select: '{kind, select, bug {A bug} task {A task} other {Something else}}',
				quote: "It''s here",
				literal: "'{literal}' stays",
				html: 'Some <b>bold</b> & <i>text</i>',
				empty: '',
				number: 42,
				danger: '<b>{name}</b>'
			}
		});
	});

	module('t', function () {
		test('it translates a key', function (assert) {
			assert.strictEqual(this.intl.t('test.plain'), 'Plain text');
			assert.strictEqual(this.intl.t('test.name', { name: 'Ann' }), 'Hello Ann');
		});

		test('it falls back to the default key, or the first existing one of an array', function (assert) {
			assert.strictEqual(this.intl.t('test.nope', { default: 'test.plain' }), 'Plain text');
			assert.strictEqual(this.intl.t('test.nope', { default: ['test.nope2', 'test.name'], name: 'Bo' }), 'Hello Bo');
		});

		test('htmlSafe returns a SafeString with the values escaped', function (assert) {
			let result = this.intl.t('test.danger', { name: '<script>', htmlSafe: true });

			assert.true(isHTMLSafe(result), 'is a SafeString');
			assert.strictEqual(result.toString(), '<b>&lt;script&gt;</b>');
			assert.false(isHTMLSafe(this.intl.t('test.danger', { name: 'x' })), 'a string without htmlSafe');
		});

		test('a missing key returns the missing translation text', function (assert) {
			assert.strictEqual(this.intl.t('test.nope'), 'Missing translation "test.nope" for locale "en-us"');
		});

		test('an empty string and numbers are returned as they are', function (assert) {
			assert.strictEqual(this.intl.t('test.empty'), '');
			assert.strictEqual(this.intl.t('test.number'), 42);
		});

		test('plural supports =N and #', function (assert) {
			assert.strictEqual(this.intl.t('test.plural', { count: 0 }), 'none');
			assert.strictEqual(this.intl.t('test.plural', { count: 1 }), 'one item');
			assert.strictEqual(this.intl.t('test.plural', { count: 5 }), '5 items');
		});

		test('plural supports offset', function (assert) {
			assert.strictEqual(this.intl.t('test.offset', { count: 0 }), 'nobody');
			assert.strictEqual(this.intl.t('test.offset', { count: 1 }), 'only you');
			assert.strictEqual(this.intl.t('test.offset', { count: 2 }), 'you and 1 other');
			assert.strictEqual(this.intl.t('test.offset', { count: 4 }), 'you and 3 others');
		});

		test('select picks the matching case, else other', function (assert) {
			assert.strictEqual(this.intl.t('test.select', { kind: 'bug' }), 'A bug');
			assert.strictEqual(this.intl.t('test.select', { kind: 'task' }), 'A task');
			assert.strictEqual(this.intl.t('test.select', { kind: 'epic' }), 'Something else');
		});

		test('ICU apostrophe rules', function (assert) {
			assert.strictEqual(this.intl.t('test.quote'), "It's here");
			assert.strictEqual(this.intl.t('test.literal'), '{literal} stays');
		});

		test('HTML tags stay plain text', function (assert) {
			assert.strictEqual(this.intl.t('test.html'), 'Some <b>bold</b> & <i>text</i>');
		});

		test('a missing placeholder value is an error', function (assert) {
			assert.throws(() => this.intl.t('test.name'));
		});
	});

	module('other methods', function () {
		test('exists and lookup', function (assert) {
			assert.true(this.intl.exists('test.plain'));
			assert.false(this.intl.exists('test.nope'));
			assert.false(this.intl.exists('test.plain', 'de-de'));
			assert.strictEqual(this.intl.lookup('test.plain'), 'Plain text');
			assert.strictEqual(this.intl.lookup('test.nope'), 'Missing translation "test.nope" for locale "en-us"');
		});

		test('translationsFor returns the translations of a locale', function (assert) {
			let translations = this.intl.translationsFor('en-us');

			assert.strictEqual(translations['test.plain'] ?? translations.test?.plain, 'Plain text');
		});

		test('addTranslations merges into the locale', function (assert) {
			this.intl.addTranslations('en-us', { test: { added: 'Added' } });

			assert.strictEqual(this.intl.t('test.added'), 'Added', 'new key');
			assert.strictEqual(this.intl.t('test.plain'), 'Plain text', 'existing key kept');

			this.intl.addTranslations('en-us', { test: { plain: 'Changed' } });
			assert.strictEqual(this.intl.t('test.plain'), 'Changed', 'existing key replaced');
		});

		test('setLocale normalises the locale to lower case', function (assert) {
			// Mixed case, not en_US: a formatter built from the raw tag would throw on underscores.
			this.intl.setLocale('EN-US');

			assert.deepEqual(this.intl.locale, ['en-us']);
			assert.strictEqual(this.intl.primaryLocale, 'en-us');
		});

		test('setLocale accepts an array, primaryLocale is the first', function (assert) {
			this.intl.setLocale(['de-de', 'en-us']);

			assert.deepEqual(this.intl.locale, ['de-de', 'en-us']);
			assert.strictEqual(this.intl.primaryLocale, 'de-de');
		});

		test('formatNumber', function (assert) {
			assert.strictEqual(this.intl.formatNumber(1234.5), '1,234.5');
			assert.strictEqual(this.intl.formatNumber(0.5, { style: 'percent' }), '50%');
		});
	});
});
