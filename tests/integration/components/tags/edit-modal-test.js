/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class AclStub extends Service {
	checkAccess() {
		return true;
	}
}

const tagged = (id, name) => ({ id, tag: { id: `t${id}`, tag: name } });

module('Integration | Component | tags/edit-modal', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		let test = this;
		test.attached = [];
		test.detached = [];
		test.failAttach = false;
		test.current = [tagged('1', 'backend')];
		test.closed = 0;
		test.saved = 0;
		test.owner.register('service:acl', AclStub);
		test.owner.register(
			'service:tags',
			class extends Service {
				async forRecord() {
					return [...test.current];
				}
				async suggest(projectId, text) {
					let all = [{ id: 't1', tag: 'backend' }, { id: 't9', tag: 'frontend' }, { id: 't8', tag: 'urgent' }];
					return all.filter((tag) => tag.tag.includes(text.toLowerCase()));
				}
				async attach(projectId, relatedTo, relatedId, text) {
					if (test.failAttach) {
						throw new Error('refused');
					}
					test.attached.push(text);
				}
				async detach(record) {
					test.detached.push(record.id);
					test.current = test.current.filter((item) => item.id !== record.id);
				}
			}
		);
		test.set('onClose', () => test.closed++);
		test.set('onSaved', () => test.saved++);
	});

	async function open() {
		await render(hbs`<Tags::EditModal @projectId="p1" @relatedTo="issue" @relatedId="4980" @onClose={{this.onClose}} @onSaved={{this.onSaved}} />`);
		await waitUntil(() => document.querySelector('[data-test-tag-chip]'));
	}

	async function type(text) {
		await fillIn('.ember-power-select-search-input, .ember-power-select-trigger-multiple-input', text);
		await waitUntil(() => document.querySelector('.ember-power-select-option'));
	}

	test('the cursor is in the input when it opens and the current tags are chips', async function (assert) {
		await open();
		assert.dom('[data-test-tag-chip]').hasText('backend');
		let active = document.activeElement;
		assert.ok(active?.matches('input'), 'an input has the focus');
		assert.ok(active.closest('dialog'), 'inside the modal');
	});

	test('typing a new text offers Add first; clicking it stages a chip and nothing is saved yet', async function (assert) {
		await open();
		await type('newtag');
		assert.dom('[data-field-relate-multi-add]').exists();
		await click('[data-field-relate-multi-add]');
		assert.dom('[data-test-tag-chip]').exists({ count: 2 });
		assert.deepEqual(this.attached, []);
	});

	test('an existing project tag is offered, without the ones the record has, and can be added', async function (assert) {
		await open();
		await type('e');
		let options = [...document.querySelectorAll('.ember-power-select-option')].map((o) => o.textContent.trim());
		assert.false(options.includes('backend'), 'backend is already on the record');
		assert.true(options.includes('urgent'));
		let option = [...document.querySelectorAll('.ember-power-select-option')].find((o) => o.textContent.trim() === 'urgent');
		await click(option);
		assert.dom('[data-test-tag-chip]').exists({ count: 2 });
	});

	test('removing a chip stages the removal', async function (assert) {
		await open();
		await click('[data-app-ui-tag-remove]');
		assert.dom('[data-test-tag-chip]').doesNotExist();
		assert.deepEqual(this.detached, []);
	});

	test('Save attaches the added and detaches the removed tags, then tells the caller and closes', async function (assert) {
		await open();
		await click('[data-app-ui-tag-remove]');
		await type('newtag');
		await click('[data-field-relate-multi-add]');
		await click('[data-btn="save"]');
		assert.deepEqual(this.detached, ['1']);
		assert.deepEqual(this.attached, ['newtag']);
		assert.strictEqual(this.saved, 1);
		await waitUntil(() => this.closed === 1);
		assert.strictEqual(this.closed, 1);
	});

	test('Cancel discards the staged changes', async function (assert) {
		await open();
		await click('[data-app-ui-tag-remove]');
		await click('[data-btn="cancel"]');
		assert.deepEqual(this.detached, []);
		assert.deepEqual(this.attached, []);
		assert.strictEqual(this.saved, 0);
		await waitUntil(() => this.closed === 1);
		assert.strictEqual(this.closed, 1);
	});

	test('when a change fails the modal stays open with the error and the actual tags', async function (assert) {
		await open();
		await click('[data-app-ui-tag-remove]');
		await type('newtag');
		await click('[data-field-relate-multi-add]');
		this.failAttach = true;
		await click('[data-btn="save"]');
		assert.dom('[data-test-tags-edit-error]').exists();
		assert.deepEqual(this.detached, ['1'], 'the removal went through');
		assert.strictEqual(this.saved, 0);
		assert.strictEqual(this.closed, 0);
		assert.dom('dialog').hasAttribute('open');
		assert.dom('[data-test-tag-chip]').doesNotExist('the reloaded tags replace the staged ones: the detach stuck, newtag did not');
	});

	test('a failing load shows the load error', async function (assert) {
		this.owner.lookup('service:tags').forRecord = async () => {
			throw new Error('down');
		};
		await render(hbs`<Tags::EditModal @projectId="p1" @relatedTo="issue" @relatedId="4980" />`);
		await waitUntil(() => document.querySelector('[data-test-tags-edit-error]'));
		assert.dom('[data-test-tags-edit-error]').exists();
	});

	test('a failing detach counts as a failure and keeps the modal open', async function (assert) {
		this.owner.lookup('service:tags').detach = async () => {
			throw new Error('refused');
		};
		await open();
		await click('[data-app-ui-tag-remove]');
		await click('[data-btn="save"]');
		assert.dom('[data-test-tags-edit-error]').exists();
		assert.strictEqual(this.saved, 0);
		assert.dom('[data-test-tag-chip]').exists({ count: 1 }, 'the tag is still there');
	});
});
