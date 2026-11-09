/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';
import { settled } from '@ember/test-helpers';
import UrlState from 'prometheus/utils/state/url-state';

class StubRouter {
	listeners = [];

	on(event, callback) {
		this.listeners.push({ event, callback });
	}

	off(event, callback) {
		this.listeners = this.listeners.filter((l) => l.event !== event || l.callback !== callback);
	}

	routeDidChange(to) {
		for (let l of this.listeners.filter((l) => l.event === 'routeDidChange')) {
			l.callback({ to });
		}
	}
}

const schema = {
	query: { default: '', type: 'string' },
	page: { default: 1, type: 'number', resetOnChange: true },
	sort: { default: 'name', type: 'string' },
	archived: { default: false, type: 'boolean' },
};

const ideasRoute = { name: 'app.project.ideas', parent: { name: 'app.project', parent: { name: 'app' } } };
const otherRoute = { name: 'app.project.board', parent: { name: 'app.project', parent: { name: 'app' } } };

function build(controllerValues = {}, routeName = 'app.project.ideas') {
	let controller = { query: '', page: 1, sort: 'name', archived: false, ...controllerValues };
	let router = new StubRouter();
	let state = new UrlState(controller, { schema, routeName, router });
	let calls = [];
	state.onChange((values, changed) => calls.push({ values, changed }));
	return { controller, router, state, calls };
}

module('Unit | Utility | state/url-state', function () {
	test('values are parsed to their types, with defaults for missing or bad values', function (assert) {
		let { state } = build({ query: 'abc', page: '3', archived: 'true', sort: undefined });
		assert.deepEqual(state.values, { query: 'abc', page: 3, sort: 'name', archived: true });

		let bad = build({ page: 'x', archived: 'maybe', query: null }).state;
		assert.deepEqual(bad.values, { query: '', page: 1, sort: 'name', archived: false });

		let numbers = build({ query: 5, page: '', archived: 'false' }).state;
		assert.deepEqual(numbers.values, { query: '5', page: 1, sort: 'name', archived: false });
	});

	test('isDefault compares to the schema default', function (assert) {
		let { state } = build({ page: '2' });
		assert.false(state.isDefault('page'));
		assert.true(state.isDefault('query'));
		assert.throws(() => state.isDefault('nope'), /unknown param "nope"/);
	});

	test('set updates the params and reports the changed names', function (assert) {
		let { controller, state, calls } = build();
		state.set({ archived: 'true', sort: 'date' });
		assert.true(controller.archived);
		assert.strictEqual(controller.sort, 'date');
		assert.deepEqual(calls, [
			{ values: { query: '', page: 1, sort: 'date', archived: true }, changed: ['sort', 'archived'] },
		]);
	});

	test('set resets page when another param changes', function (assert) {
		let { controller, state, calls } = build({ page: 4 });
		state.set({ query: 'x' });
		assert.strictEqual(controller.page, 1);
		assert.deepEqual(calls[0].changed, ['query', 'page']);
	});

	test('set keeps page when it is set in the same call, and changing only page keeps it', function (assert) {
		let { controller, state } = build({ page: 4 });
		state.set({ query: 'x', page: 2 });
		assert.strictEqual(controller.page, 2);
		state.set({ page: 3 });
		assert.strictEqual(controller.page, 3);
	});

	test('set with the same values does nothing', function (assert) {
		let { controller, state, calls } = build({ page: 4, query: 'x' });
		state.set({ query: 'x', page: '4' });
		assert.strictEqual(controller.page, 4);
		assert.strictEqual(calls.length, 0);
	});

	test('set rejects unknown params', function (assert) {
		let { state } = build();
		assert.throws(() => state.set({ nope: 1 }), /unknown param "nope"/);
	});

	test('an external change on the owning route reports only the changed names', function (assert) {
		let { controller, router, calls } = build();
		controller.page = '2';
		controller.query = 'back';
		router.routeDidChange(ideasRoute);
		assert.deepEqual(calls, [
			{ values: { query: 'back', page: 2, sort: 'name', archived: false }, changed: ['query', 'page'] },
		]);

		router.routeDidChange(ideasRoute);
		assert.strictEqual(calls.length, 1, 'no second report without a new change');
	});

	test('a set followed by its routeDidChange reports once', function (assert) {
		let { router, state, calls } = build();
		state.set({ sort: 'date' });
		router.routeDidChange(ideasRoute);
		assert.strictEqual(calls.length, 1);
	});

	test('route changes to other routes are ignored', function (assert) {
		let { controller, router, calls } = build();
		controller.query = 'x';
		router.routeDidChange(otherRoute);
		router.routeDidChange(null);
		assert.strictEqual(calls.length, 0);
	});

	test('a child route of the owning route counts', function (assert) {
		let { controller, router, calls } = build({}, 'app.project');
		controller.query = 'x';
		router.routeDidChange(ideasRoute);
		assert.deepEqual(calls[0].changed, ['query']);
	});

	test('resetToDefaults puts every param back and reports the change', function (assert) {
		let { controller, state, calls } = build({ query: 'x', page: 3, archived: true });
		state.resetToDefaults();
		assert.deepEqual(
			{ query: controller.query, page: controller.page, sort: controller.sort, archived: controller.archived },
			{ query: '', page: 1, sort: 'name', archived: false }
		);
		assert.deepEqual(calls[0].changed, ['query', 'page', 'archived']);
	});

	test('the resetController hook resets silently', function (assert) {
		let { controller, router, state, calls } = build({ query: 'x', page: 3 });
		controller.urlState = state;
		UrlState.resetController(controller);
		assert.strictEqual(controller.query, '');
		assert.strictEqual(controller.page, 1);
		router.routeDidChange(ideasRoute);
		assert.strictEqual(calls.length, 0);

		UrlState.resetController({}, 'urlState');
		assert.ok(true, 'a controller without a UrlState is ignored');
	});

	test('onChange returns an unsubscribe function', function (assert) {
		let { state } = build();
		let seen = 0;
		let off = state.onChange(() => seen++);
		state.set({ query: 'a' });
		off();
		state.set({ query: 'b' });
		assert.strictEqual(seen, 1);
	});

	test('destroying the controller removes the router listener and callbacks', async function (assert) {
		let { controller, router, calls } = build();
		assert.strictEqual(router.listeners.length, 1);
		destroy(controller);
		await settled();
		assert.strictEqual(router.listeners.length, 0);
		controller.query = 'x';
		router.routeDidChange(ideasRoute);
		assert.strictEqual(calls.length, 0);
	});

	test('queryParamsConfig turns off refreshModel for every param', function (assert) {
		assert.deepEqual(UrlState.queryParamsConfig(schema), {
			query: { refreshModel: false },
			page: { refreshModel: false },
			sort: { refreshModel: false },
			archived: { refreshModel: false },
		});
	});

	test('a throwing callback does not stop the other callbacks', function (assert) {
		let { state, calls } = build();
		state.onChange(() => {
			throw new Error('boom');
		});
		let later = [];
		state.onChange((values) => later.push(values));
		assert.throws(() => state.set({ query: 'x' }), /boom/);
		assert.strictEqual(calls.length, 1);
		assert.strictEqual(later.length, 1);
	});

	test('a missing router throws', function (assert) {
		assert.throws(() => new UrlState({}, { schema }), /no router/);
	});

	test('the schema is validated', function (assert) {
		let router = new StubRouter();
		assert.throws(() => new UrlState({}, { router }), /schema/);
		assert.throws(() => new UrlState({}, { router, schema: { a: { default: 1, type: 'date' } } }), /needs a type/);
		assert.throws(
			() => new UrlState({}, { router, schema: { a: { default: '1', type: 'number' } } }),
			/not a number/
		);
	});
});
