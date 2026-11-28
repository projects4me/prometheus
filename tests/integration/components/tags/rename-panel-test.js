/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, fillIn, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';
import Context from '../../../../mirage/yadda-context/context';

module('Integration | Component | tags/edit-modal project-wide change', function (hooks) {
	setupRenderingTest(hooks);
	setupMirage(hooks);

	hooks.beforeEach(function () {
		new Context().clear();
		let test = this;
		test.allowed = ['tag.update', 'tag.delete', 'tagged.delete'];
		test.owner.register(
			'service:acl',
			class extends Service {
				checkAccess(context) {
					return test.allowed.includes(context);
				}
			}
		);
		test.saved = 0;
		test.set('onSaved', () => test.saved++);
		test.set('onClose', () => {});
		test.ember = this.server.create('tag', { projectId: 'p1', tag: 'Ember 6.5' });
		test.target = this.server.create('tag', { projectId: 'p1', tag: 'Ember 7' });
		this.server.create('tagged', { projectId: 'p1', tagId: String(test.ember.id), relatedTo: 'issue', relatedId: '4980' });
		this.server.create('tagged', { projectId: 'p1', tagId: String(test.ember.id), relatedTo: 'issue', relatedId: '4981' });
		this.server.create('tagged', { projectId: 'p1', tagId: String(test.ember.id), relatedTo: 'conversationroom', relatedId: '7' });
	});

	async function open() {
		await render(hbs`<Tags::EditModal @projectId="p1" @relatedTo="issue" @relatedId="4980" @onClose={{this.onClose}} @onSaved={{this.onSaved}} />`);
		await waitUntil(() => document.querySelector('[data-test-tag-chip]'));
	}

	async function openRename() {
		await open();
		await click('[data-test-tags-edit-rename]');
		await waitUntil(() => document.querySelector('[data-test-tags-rename-usage]'));
	}

	test('the pencil opens the panel with the name focused and the usage', async function (assert) {
		await openRename();
		assert.dom('[data-test-tags-rename-title]').includesText('Ember 6.5');
		assert.dom('[data-test-tags-rename-usage]').hasText('Used on 2 issues and 1 thread.');
		assert.dom('[data-test-tags-rename-panel] input').hasValue('Ember 6.5').isFocused();
		assert.dom('[data-test-tags-rename-confirm]').isDisabled('unchanged name');
		assert.dom('.ember-power-select-trigger').doesNotExist('the suggestions are replaced');
	});

	test('no pencil without tag.update or tag.delete', async function (assert) {
		this.allowed = ['tagged.delete'];
		await open();
		assert.dom('[data-test-tags-edit-rename]').doesNotExist();
	});

	test('rename saves at once, updates the chip and refreshes the page when the modal closes', async function (assert) {
		await openRename();
		await fillIn('[data-test-tags-rename-panel] input', 'Ember 8');
		await click('[data-test-tags-rename-confirm]');
		assert.strictEqual(this.server.schema.tags.find(this.ember.id).tag, 'Ember 8');
		assert.dom('[data-test-tags-rename-panel]').doesNotExist();
		assert.dom('[data-test-tag-chip]').hasText('Ember 8');
		assert.strictEqual(this.saved, 0);
		await click('[data-btn="cancel"]');
		await waitUntil(() => this.saved === 1);
		assert.strictEqual(this.saved, 1, 'the page chips refresh');
	});

	test('a name another tag has offers a merge and sends mergeInto', async function (assert) {
		await openRename();
		await fillIn('[data-test-tags-rename-panel] input', 'ember 7');
		await waitUntil(() => document.querySelector('[data-test-tags-rename-merge]'));
		assert.dom('[data-test-tags-rename-merge]').includesText('“Ember 7” already exists');
		assert.dom('[data-test-tags-rename-confirm]').includesText('Merge into “Ember 7”');
		await click('[data-test-tags-rename-confirm]');
		assert.strictEqual(this.server.schema.tags.find(this.ember.id), null, 'the tag is gone');
		assert.dom('[data-test-tags-rename-panel]').doesNotExist();
		assert.dom('[data-test-tag-chip]').hasText('Ember 7', 'replaced by the target');
	});

	test('delete everywhere asks for confirmation, then removes the tag and its chip', async function (assert) {
		await openRename();
		await click('[data-test-tags-rename-delete]');
		assert.strictEqual(this.server.schema.tags.find(this.ember.id).tag, 'Ember 6.5', 'not yet');
		await click('[data-test-tags-rename-delete-yes]');
		assert.strictEqual(this.server.schema.tags.find(this.ember.id), null);
		assert.dom('[data-test-tag-chip]').doesNotExist();
	});

	test('a failed change keeps the panel open with the error', async function (assert) {
		this.server.patch('/tag/:id', () => new Response(500, {}, {}));
		await openRename();
		await fillIn('[data-test-tags-rename-panel] input', 'Ember 8');
		await click('[data-test-tags-rename-confirm]');
		assert.dom('[data-test-tags-rename-error]').exists();
		assert.dom('[data-test-tags-rename-panel]').exists();
	});
});
