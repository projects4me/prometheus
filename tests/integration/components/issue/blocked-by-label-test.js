/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

const issue = (number, projectId = 'p1', shortcode = 'APROM') => ({ id: String(number), issueNumber: number, projectId, projectShortcode: shortcode });

module('Integration | Component | issue/blocked-by-label', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		let test = this;
		test.blockers = [];
		test.owner.register(
			'service:issue-relations',
			class extends Service {
				async openBlockers() {
					return test.blockers;
				}
			}
		);
		test.set('issue', issue(1));
		test.set('version', 0);
	});

	const text = () => document.querySelector('[data-test-blocked-by]')?.textContent.replace(/\s+/g, ' ').trim();

	test('nothing is shown without open blockers', async function (assert) {
		await render(hbs`<Issue::BlockedByLabel @issue={{this.issue}} @refreshKey={{this.version}} />`);
		assert.dom('[data-test-blocked-by]').doesNotExist();
	});

	test('one blocker, a cross-project one by its code', async function (assert) {
		this.blockers = [issue(4836, 'p2', 'AGAIA')];
		await render(hbs`<Issue::BlockedByLabel @issue={{this.issue}} @refreshKey={{this.version}} />`);
		assert.dom('[data-test-blocked-by].app-ui-tag-danger .fa-ban').exists();
		assert.strictEqual(text(), 'Blocked by agaia-4836');
		assert.dom('[data-test-blocked-by-link]').exists({ count: 1 });
	});

	test('three blockers show two numbers and +1', async function (assert) {
		this.blockers = [issue(2), issue(3), issue(4)];
		await render(hbs`<Issue::BlockedByLabel @issue={{this.issue}} @refreshKey={{this.version}} />`);
		assert.strictEqual(text(), 'Blocked by #2, #3 +1');
		assert.dom('[data-test-blocked-by-link]').exists({ count: 2 });
	});

	test('reloads when the refresh key changes', async function (assert) {
		await render(hbs`<Issue::BlockedByLabel @issue={{this.issue}} @refreshKey={{this.version}} />`);
		assert.dom('[data-test-blocked-by]').doesNotExist();
		this.blockers = [issue(2)];
		this.set('version', 1);
		await settled();
		assert.strictEqual(text(), 'Blocked by #2');
	});
});
