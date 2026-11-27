/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the Font Awesome 4 markup, hidden from assistive technology', async function (assert) {
    await render(hbs`<AppUi::Icon @name="users" />`);

    assert.dom('i').exists({ count: 1 });
    assert.strictEqual(
      this.element.querySelector('i').getAttribute('class'),
      'fa fa-users',
    );
    assert.dom('i').hasAttribute('aria-hidden', 'true');
    assert.dom('i').hasText('');
  });

  test('it strips a leading fa- from the name', async function (assert) {
    this.set('name', 'fa-cog');
    await render(hbs`<AppUi::Icon @name={{this.name}} />`);
    assert.strictEqual(
      this.element.querySelector('i').getAttribute('class'),
      'fa fa-cog',
    );

    this.set('name', 'bell');
    assert.strictEqual(
      this.element.querySelector('i').getAttribute('class'),
      'fa fa-bell',
    );
  });

  test('@fixedWidth adds fa-fw', async function (assert) {
    await render(hbs`<AppUi::Icon @name="users" @fixedWidth={{true}} />`);
    assert.dom('i').hasClass('fa-fw');
  });

  test('@spin adds fa-spin', async function (assert) {
    await render(hbs`<AppUi::Icon @name="refresh" @spin={{true}} />`);
    assert.dom('i').hasClass('fa-spin');
  });

  test('@size adds each Font Awesome size and ignores unknown ones', async function (assert) {
    this.set('size', 'lg');
    await render(hbs`<AppUi::Icon @name="users" @size={{this.size}} />`);
    assert.dom('i').hasClass('fa-lg');

    for (let size of ['2x', '3x', '4x', '5x']) {
      this.set('size', size);
      assert.dom('i').hasClass(`fa-${size}`);
    }

    this.set('size', 'huge');
    assert.strictEqual(
      this.element.querySelector('i').getAttribute('class'),
      'fa fa-users',
    );
  });

  test('the arguments combine in a fixed order', async function (assert) {
    await render(
      hbs`<AppUi::Icon @name="fa-spinner" @fixedWidth={{true}} @spin={{true}} @size="2x" />`,
    );
    assert.strictEqual(
      this.element.querySelector('i').getAttribute('class'),
      'fa fa-spinner fa-fw fa-spin fa-2x',
    );
  });

  test('@label names the icon for assistive technology', async function (assert) {
    await render(hbs`<AppUi::Icon @name="trash" @label="Delete" />`);

    assert.dom('i').doesNotHaveAttribute('aria-hidden');
    assert.dom('i .sr-only').hasText('Delete');
  });

  test('classes, attributes and modifiers pass through', async function (assert) {
    this.set('clicked', 0);
    this.set('onClick', () => this.set('clicked', this.clicked + 1));
    await render(
      hbs`<AppUi::Icon @name="times" class="text-danger pull-right" title="Remove" data-test-icon {{on "click" this.onClick}} />`,
    );

    assert.dom('[data-test-icon]').hasClass('fa');
    assert.dom('[data-test-icon]').hasClass('fa-times');
    assert.dom('[data-test-icon]').hasClass('text-danger');
    assert.dom('[data-test-icon]').hasClass('pull-right');
    assert.dom('[data-test-icon]').hasAttribute('title', 'Remove');
    await click('[data-test-icon]');
    assert.strictEqual(this.clicked, 1);
  });

  test('a passed aria-hidden wins over the default', async function (assert) {
    await render(hbs`<AppUi::Icon @name="users" aria-hidden="false" />`);
    assert.dom('i').hasAttribute('aria-hidden', 'false');
  });
});
