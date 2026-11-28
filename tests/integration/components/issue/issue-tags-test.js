/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | issue/issue-tags', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		let t = this;
		t.allowed = ['tagged.create', 'tagged.delete'];
		t.loads = 0;
		t.owner.register('service:acl', class extends Service {
			checkAccess(key) {
				return t.allowed.includes(key);
			}
		});
		t.owner.register('service:tags', class extends Service {
			async forRecord() {
				t.loads++;
				return [{ id: '1', tag: { id: 't1', tag: 'backend' } }];
			}
			async suggest() {
				return [];
			}
		});
		t.set('issue', { id: '7', issueNumber: 12, projectId: 'p1', projectShortcode: 'P1' });
	});

	const render_ = () => render(hbs`<Issue::IssueTags @issue={{this.issue}} />`);

	test('shows chips without a remove button and the edit button', async function (assert) {
		await render_();
		await waitUntil(() => document.querySelector('[data-test-issue-tag]'));
		assert.dom('[data-test-issue-tag="backend"]').exists();
		assert.dom('[data-app-ui-tag-remove]').doesNotExist();
		assert.dom('[data-test-issue-tags-add] .fa-plus').exists();
		assert.dom('[data-test-tags-edit-modal]').doesNotExist();
	});

	test('the plus button opens the modal with the issue title', async function (assert) {
		await render_();
		await click('[data-test-issue-tags-add]');
		assert.dom('[data-test-tags-edit-modal]').exists();
		assert.dom('[data-test-tags-edit-modal] .modal-title').hasText('Tags of #12');
	});

	test('without tagged.create and tagged.delete there is no button', async function (assert) {
		this.allowed = [];
		await render_();
		await waitUntil(() => document.querySelector('[data-test-issue-tag]'));
		assert.dom('[data-test-issue-tags-add]').doesNotExist();
	});

	test('with only tagged.delete the button is shown', async function (assert) {
		this.allowed = ['tagged.delete'];
		await render_();
		await waitUntil(() => document.querySelector('[data-test-issue-tag]'));
		assert.dom('[data-test-issue-tags-add]').exists();
	});
});
