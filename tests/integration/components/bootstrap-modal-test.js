/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, waitFor, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import jQuery from 'jquery';
import AclStub from '../stub-services/acl-stub';

module('Integration | Component | bootstrap-modal', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.confirmed = 0;
        this.closed = 0;
        this.set('close', () => this.closed++);
    });

    hooks.afterEach(function () {
        jQuery('.modal-backdrop').remove();
        jQuery('body').removeClass('modal-open');
    });

    const isShown = () => jQuery('.modal').data('bs.modal').isShown;

    const renderModal = (context, confirm) => {
        context.set('confirm', () => {
            context.confirmed++;
            return confirm();
        });
        return render(hbs`
            {{#bootstrap-modal
                title="global.form.close"
                closeLabel="global.form.close"
                confirmLabel="global.form.close"
                close=this.close
                confirm=this.confirm}}
              <p data-test-body>Body</p>
            {{/bootstrap-modal}}`);
    };

    test('a confirm returning a Promise shows the spinner, ignores double clicks and closes on resolve', async function (assert) {
        let resolve;
        await renderModal(this, () => new Promise(r => { resolve = r; }));

        let confirmButton = document.querySelector('.modal .btn-primary');
        confirmButton.click();
        confirmButton.click();
        await waitFor('.modal .btn-primary .fa-spinner.fa-spin');

        assert.strictEqual(this.confirmed, 1, 'the second click is ignored');
        assert.dom('.modal .btn-primary').isDisabled();
        assert.dom('.modal [data-btn="cancel"]').isDisabled();
        assert.dom('.modal .close').isDisabled();

        resolve(true);
        await waitUntil(() => this.closed === 1, { timeout: 2000 });
        assert.strictEqual(this.closed, 1, 'closed through hidden.bs.modal');
        assert.false(isShown(), 'the modal is hidden');
    });

    test('a confirm whose Promise rejects keeps the modal open with its buttons enabled again', async function (assert) {
        let reject;
        await renderModal(this, () => new Promise((r, j) => { reject = j; }));

        document.querySelector('.modal .btn-primary').click();
        await waitFor('.modal .btn-primary .fa-spinner');

        reject(new Error('Boom'));
        await waitUntil(() => !document.querySelector('.modal .btn-primary .fa-spinner'));
        await settled();

        assert.dom('.modal .btn-primary').isNotDisabled();
        assert.dom('.modal [data-btn="cancel"]').isNotDisabled();
        assert.true(isShown(), 'the modal stays open');
        assert.strictEqual(this.closed, 0);
    });

    test('Esc or a backdrop click does not hide the modal while a confirm is running', async function (assert) {
        let resolve;
        await renderModal(this, () => new Promise(r => { resolve = r; }));

        document.querySelector('.modal .btn-primary').click();
        await waitFor('.modal .btn-primary .fa-spinner');

        jQuery('.modal').modal('hide');
        await settled();
        assert.true(isShown(), 'the modal stays open while busy');
        assert.strictEqual(this.closed, 0);

        resolve(true);
        await waitUntil(() => this.closed === 1, { timeout: 2000 });
        assert.false(isShown(), 'the modal hides once the confirm resolves');
    });

    test('a confirm returning true closes the modal', async function (assert) {
        await renderModal(this, () => true);

        await click('.modal .btn-primary');
        await waitUntil(() => this.closed === 1, { timeout: 2000 });

        assert.strictEqual(this.confirmed, 1);
        assert.strictEqual(this.closed, 1);
        assert.dom('.modal .fa-spinner').doesNotExist();
    });

    test('a confirm returning false keeps the modal open', async function (assert) {
        await renderModal(this, () => false);

        await click('.modal .btn-primary');

        assert.strictEqual(this.confirmed, 1);
        assert.strictEqual(this.closed, 0);
        assert.true(isShown(), 'the modal stays open');
        assert.dom('.modal .btn-primary').isNotDisabled();
        assert.dom('.modal .fa-spinner').doesNotExist();
    });
});
