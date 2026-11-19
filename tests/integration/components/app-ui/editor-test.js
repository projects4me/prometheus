/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, focus, blur } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { isEditorEmpty } from 'prometheus/utils/ui/editor-empty';

module('Integration | Component | app-ui/editor', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
    });

    test('it renders a bare box without a label', async function (assert) {
        await render(hbs`<AppUi::Editor @value="<p>Hi</p>" />`);

        assert.dom('[data-app-ui-editor] .toast-ui-editor').exists();
        assert.dom('[data-form-field="label"]').doesNotExist();
    });

    test('it shows the label, required mark and message after blur', async function (assert) {
        this.set('validated', null);
        this.set('validate', (value) => this.set('validated', value));
        await render(hbs`<AppUi::Editor @value="" @label="Description" @required={{true}} @message="Required" @validate={{this.validate}} />`);

        assert.dom('[data-form-field="label"]').includesText('Description');
        assert.dom('[data-form-field="label"] .required').exists();
        assert.dom('[data-app-ui-editor-message]').doesNotExist();

        await focus('.tui-editor-contents[contenteditable="true"]');
        await blur('.tui-editor-contents[contenteditable="true"]');

        assert.strictEqual(this.validated, '', 'validate gets the content');
        assert.dom('[data-app-ui-editor-message]').hasText('Required');
    });

    test('a user without access does not see it', async function (assert) {
        this.owner.register('service:acl', class extends AclStub {
            checkAccess() {
                return false;
            }
        });
        await render(hbs`<AppUi::Editor @value="x" @aclContext="nothing.nobody" />`);

        assert.dom('[data-app-ui-editor]').doesNotExist();
    });

    test('readonly shows the viewer, not the editor', async function (assert) {
        await render(hbs`<AppUi::Editor @value="<p>Read me</p>" @readonly={{true}} />`);

        assert.dom('[data-app-ui-editor-viewer]').exists();
        assert.dom('[data-app-ui-editor] .toast-ui-editor').doesNotExist();
        assert.dom('[data-app-ui-editor-viewer]').includesText('Read me');
    });

    test('disabled makes the box inert', async function (assert) {
        await render(hbs`<AppUi::Editor @value="x" @disabled={{true}} />`);

        assert.dom('[data-app-ui-editor]').hasClass('app-ui-editor-disabled');
        assert.dom('.app-ui-editor-box').hasAttribute('inert');
    });

    test('isEditorEmpty strips tags and whitespace', function (assert) {
        assert.true(isEditorEmpty('<p><br></p>'));
        assert.true(isEditorEmpty('<p>&nbsp; </p>'));
        assert.true(isEditorEmpty(''));
        assert.true(isEditorEmpty(undefined));
        assert.false(isEditorEmpty('<p>a</p>'));
        assert.false(isEditorEmpty('<p><img src="x.png"></p>'));
    });
});
