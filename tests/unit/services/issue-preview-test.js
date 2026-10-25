import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | issue-preview', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.service = this.owner.lookup('service:issue-preview');
		this.opened = [];
		this.handlers = {
			hasIssue: (issueId) => issueId === '7',
			open: (issueId) => this.opened.push(issueId)
		};
	});

	test('open returns false when no screen is registered', function (assert) {
		assert.false(this.service.open('7'));
	});

	test('open sends an issue the registered screen has to its preview', function (assert) {
		this.service.register({}, this.handlers);

		assert.true(this.service.open('7'));
		assert.deepEqual(this.opened, ['7']);
	});

	test('open passes the issue id as a string', function (assert) {
		this.service.register({}, this.handlers);

		assert.true(this.service.open(7));
		assert.deepEqual(this.opened, ['7']);
	});

	test('open returns false when the registered screen does not have the issue', function (assert) {
		this.service.register({}, this.handlers);

		assert.false(this.service.open('8'));
		assert.deepEqual(this.opened, []);
	});

	test('open returns false without an issue id', function (assert) {
		this.service.register({}, this.handlers);

		assert.false(this.service.open(null));
		assert.false(this.service.open(''));
		assert.deepEqual(this.opened, []);
	});

	test('the disposer removes the registration', function (assert) {
		let dispose = this.service.register({}, this.handlers);
		dispose();

		assert.false(this.service.open('7'));
		assert.deepEqual(this.opened, []);
	});

	test('a new registration replaces the previous one', function (assert) {
		let otherOpened = [];
		this.service.register({}, this.handlers);
		this.service.register({}, {
			hasIssue: () => true,
			open: (issueId) => otherOpened.push(issueId)
		});

		assert.true(this.service.open('7'));
		assert.deepEqual(this.opened, []);
		assert.deepEqual(otherOpened, ['7']);
	});

	test('a stale disposer does not remove a newer registration', function (assert) {
		let disposeFirst = this.service.register({}, { hasIssue: () => true, open() {} });
		this.service.register({}, this.handlers);
		disposeFirst();
		disposeFirst();

		assert.true(this.service.open('7'));
		assert.deepEqual(this.opened, ['7']);
	});

	test('register requires an owner, hasIssue and open', function (assert) {
		assert.throws(() => this.service.register(null, this.handlers));
		assert.throws(() => this.service.register({}, { open() {} }));
		assert.throws(() => this.service.register({}, { hasIssue() {} }));
	});
});
