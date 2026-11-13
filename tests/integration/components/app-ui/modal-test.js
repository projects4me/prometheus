/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, waitFor, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { topmostModal } from 'prometheus/utils/ui/modal-stack';

module('Integration | Component | app-ui/modal', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.confirmed = 0;
        this.closed = 0;
        this.left = 0;
        this.set('show', true);
        this.set('onClose', () => {
            this.closed++;
            this.set('show', false);
        });
        this.set('leftAction', () => this.left++);
    });

    const DIALOG = 'dialog.app-modal';

    const renderModal = (context, confirm = () => true) => {
        context.set('confirm', () => {
            context.confirmed++;
            return confirm();
        });
        return render(hbs`
            {{#if this.show}}
              <AppUi::Modal
                @title="global.form.close"
                @closeLabel="global.form.close"
                @confirmLabel="global.form.save"
                @leftLabel="global.form.close"
                @leftAction={{this.leftAction}}
                @containerClass="custom-modal"
                @onClose={{this.onClose}}
                @confirm={{this.confirm}}>
                <p data-test-body>Body</p>
              </AppUi::Modal>
            {{/if}}`);
    };

    const dialog = () => document.querySelector(DIALOG);

    const pressEsc = (element = dialog()) => {
        let event = new Event('cancel', { cancelable: true });
        element.dispatchEvent(event);
        return event;
    };

    const waitClosed = (context, count = 1) => waitUntil(() => context.closed === count, { timeout: 2000 });

    test('it opens as a modal when rendered and keeps the Bootstrap inner markup', async function (assert) {
        await renderModal(this);

        assert.true(dialog().open, 'the dialog is open');
        assert.true(dialog().matches(':modal'), 'opened with showModal()');
        assert.dom(DIALOG).hasClass('custom-modal');
        assert.dom(DIALOG).doesNotHaveClass('modal', 'no Bootstrap .modal class');
        assert.dom(`${DIALOG} > .modal-dialog > .modal-content.box.box-primary > .modal-header .modal-title`).exists();
        assert.dom(`${DIALOG} .modal-header button.close .fa-times`).exists();
        assert.dom(`${DIALOG} .modal-header button.close`).hasAttribute('aria-label', 'Close').doesNotHaveAttribute('aria-hidden');
        assert.dom(`${DIALOG} .modal-body [data-test-body]`).hasText('Body');
        assert.dom(`${DIALOG} .modal-footer [data-btn="cancel"]`).exists();
        assert.dom(`${DIALOG} .modal-footer [data-btn="save"]`).exists();
        assert.dom(`${DIALOG} .modal-footer [data-btn="left"]`).exists();
        assert.strictEqual(
            dialog().getAttribute('aria-labelledby'),
            document.querySelector(`${DIALOG} .modal-title`).id,
            'labelled by its title'
        );
    });

    test('a confirm returning true closes it and calls onClose', async function (assert) {
        await renderModal(this, () => true);

        await click(`${DIALOG} [data-btn="save"]`);
        await waitClosed(this);

        assert.strictEqual(this.confirmed, 1);
        assert.strictEqual(this.closed, 1);
        assert.dom(DIALOG).doesNotExist();
    });

    test('a confirm returning a falsy value keeps it open', async function (assert) {
        await renderModal(this, () => false);

        await click(`${DIALOG} [data-btn="save"]`);
        await settled();

        assert.strictEqual(this.confirmed, 1);
        assert.true(dialog().open);
        assert.strictEqual(this.closed, 0);
    });

    test('a confirm returning a Promise makes it busy, blocks Esc and backdrop, and closes on resolve', async function (assert) {
        let resolve;
        await renderModal(this, () => new Promise(r => { resolve = r; }));

        let confirmButton = document.querySelector(`${DIALOG} [data-btn="save"]`);
        confirmButton.click();
        confirmButton.click();
        await waitFor(`${DIALOG} [data-btn="save"] .fa-spinner.fa-spin`);

        assert.strictEqual(this.confirmed, 1, 'the second click is ignored');
        assert.dom(`${DIALOG} [data-btn="save"]`).isDisabled();
        assert.dom(`${DIALOG} [data-btn="cancel"]`).isDisabled();
        assert.dom(`${DIALOG} [data-btn="left"]`).isDisabled();
        assert.dom(`${DIALOG} .close`).isDisabled();

        assert.true(pressEsc().defaultPrevented, 'Esc is cancelled while busy');
        await click(DIALOG);
        await settled();
        assert.true(dialog().open, 'Esc and backdrop clicks are ignored while busy');

        resolve(true);
        await waitClosed(this);
        assert.strictEqual(this.closed, 1);
        assert.dom(DIALOG).doesNotExist();
    });

    test('a confirm whose Promise resolves falsy keeps it open with its buttons enabled again', async function (assert) {
        let resolve;
        await renderModal(this, () => new Promise(r => { resolve = r; }));

        document.querySelector(`${DIALOG} [data-btn="save"]`).click();
        await waitFor(`${DIALOG} [data-btn="save"] .fa-spinner`);

        resolve(false);
        await waitUntil(() => !document.querySelector(`${DIALOG} [data-btn="save"] .fa-spinner`));
        await settled();

        assert.dom(`${DIALOG} [data-btn="save"]`).isNotDisabled();
        assert.true(dialog().open);
        assert.strictEqual(this.closed, 0);
    });

    test('a confirm whose Promise rejects keeps it open with its buttons enabled again', async function (assert) {
        let reject;
        await renderModal(this, () => new Promise((r, j) => { reject = j; }));

        document.querySelector(`${DIALOG} [data-btn="save"]`).click();
        await waitFor(`${DIALOG} [data-btn="save"] .fa-spinner`);

        reject(new Error('Boom'));
        await waitUntil(() => !document.querySelector(`${DIALOG} [data-btn="save"] .fa-spinner`));
        await settled();

        assert.dom(`${DIALOG} [data-btn="save"]`).isNotDisabled();
        assert.dom(`${DIALOG} [data-btn="cancel"]`).isNotDisabled();
        assert.true(dialog().open, 'the modal stays open');
        assert.strictEqual(this.closed, 0);

        await click(`${DIALOG} [data-btn="cancel"]`);
        await waitClosed(this);
        assert.strictEqual(this.closed, 1, 'it can be closed afterwards');
    });

    test('the left action runs and closes it', async function (assert) {
        await renderModal(this);

        await click(`${DIALOG} [data-btn="left"]`);
        await waitClosed(this);

        assert.strictEqual(this.left, 1);
        assert.strictEqual(this.confirmed, 0);
        assert.strictEqual(this.closed, 1);
    });

    test('Cancel, the header close icon, Esc and a backdrop click close it', async function (assert) {
        await renderModal(this);
        await click(`${DIALOG} [data-btn="cancel"]`);
        await waitClosed(this, 1);

        this.set('show', true);
        await settled();
        await click(`${DIALOG} .modal-header .close`);
        await waitClosed(this, 2);

        this.set('show', true);
        await settled();
        assert.true(pressEsc().defaultPrevented, 'Esc goes through the same close path');
        await waitClosed(this, 3);

        this.set('show', true);
        await settled();
        await click(`${DIALOG} .modal-body`);
        await settled();
        assert.true(dialog().open, 'a click inside the box does not close it');
        await click(DIALOG);
        await waitClosed(this, 4);

        assert.strictEqual(this.closed, 4);
        assert.strictEqual(this.confirmed, 0);
    });

    test('removing it from the page closes it without calling onClose', async function (assert) {
        await renderModal(this);
        let element = dialog();

        this.set('show', false);
        await settled();

        assert.false(element.isConnected, 'the dialog left the page');
        assert.false(element.open, 'the dialog is closed');
        assert.strictEqual(topmostModal(), null);
        assert.strictEqual(this.closed, 0);
    });

    test('nested modals stack and close one at a time', async function (assert) {
        this.set('showInner', true);
        this.innerClosed = 0;
        this.set('closeInner', () => {
            this.innerClosed++;
            this.set('showInner', false);
        });
        await render(hbs`
            {{#if this.show}}
              <AppUi::Modal @title="global.form.close" @closeLabel="global.form.close" @containerClass="outer" @onClose={{this.onClose}}>
                {{#if this.showInner}}
                  <AppUi::Modal @title="global.form.save" @closeLabel="global.form.close" @containerClass="inner" @onClose={{this.closeInner}}>
                    <p>Inner</p>
                  </AppUi::Modal>
                {{/if}}
              </AppUi::Modal>
            {{/if}}`);

        let outer = document.querySelector('dialog.outer');
        let inner = document.querySelector('dialog.inner');
        assert.true(outer.open && inner.open, 'both are open');
        assert.strictEqual(topmostModal(), inner, 'the inner one is on top');

        pressEsc(inner);
        await waitUntil(() => this.innerClosed === 1, { timeout: 2000 });
        assert.true(outer.open, 'closing the inner one leaves the outer open');
        assert.strictEqual(this.closed, 0);
        assert.strictEqual(topmostModal(), outer);

        await click('dialog.outer > .modal-dialog [data-btn="cancel"]');
        await waitClosed(this);
        assert.strictEqual(topmostModal(), null);
    });

    test('Messenger moves into the open dialog and back to body when it closes', async function (assert) {
        await renderModal(this);

        let list = window.Messenger().$el[0];
        assert.strictEqual(list.parentNode, dialog(), 'messages show inside the dialog, above its backdrop');

        await click(`${DIALOG} [data-btn="cancel"]`);
        await waitClosed(this);
        assert.strictEqual(list.parentNode, document.body, 'back in body');
    });
});
