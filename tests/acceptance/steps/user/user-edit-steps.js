/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert)
        .when('User clicks on name field to edit', async function () {
            await click('.user-name .app-ui-inline-editable__surface');
            assert.ok(true, 'User clicked on name field to edit');
        })
        .when('User edits name to "$name"', async function (name) {
            await fillIn('[data-field="user-page.name"] input', name);
            assert.ok(true, `User edited name to ${name}`);
        })
        .when('User clears name field', async function () {
            await fillIn('[data-field="user-page.name"] input', '');
            assert.ok(true, 'User cleared name field');
        })
        .when('User clicks on designation field to edit', async function () {
            await click('.user-designation .app-ui-inline-editable__surface');
            assert.ok(true, 'User clicked on designation field to edit');
        })
        .when('User edits designation to "$designation"', async function (designation) {
            await fillIn('[data-field="user-page.title"] input', designation);
            assert.ok(true, `User edited designation to ${designation}`);
        })
        .when('User clicks on timezone field to edit', async function () {
            await click('.user-timezone .app-ui-inline-editable__surface');
            assert.ok(true, 'User clicked on timezone field to edit');
        })
        .when('User selects "$timezone" from timezone dropdown', async function (timezone) {
            await click('[data-field="user-page.timezone"] .ember-power-select-trigger');
            await fillIn('.ember-power-select-search input', timezone);
            let options = document.querySelectorAll('.ember-power-select-option');
            let target = Array.from(options).find((opt) => opt.textContent.trim().startsWith(timezone));
            await click(target || options[0]);
            assert.ok(true, `User selected timezone ${timezone}`);
        })
        .when('User saves inline edit', async function () {
            await click(document.querySelector('.app-ui-inline-editable__toolbar button[aria-label="Save"]'));
            assert.ok(true, 'User saved inline edit');
        })
        .when('User cancels inline edit', async function () {
            await click(document.querySelector('.app-ui-inline-editable__toolbar button[aria-label="Cancel"]'));
            assert.ok(true, 'User cancelled inline edit');
        })
        .then('User name should be "$name"', function (name) {
            assert.dom('.user-name .app-ui-inline-editable__display-value').hasText(name, `User name should be ${name}`);
        })
        .then('User should see name validation error', function () {
            let errorEl = document.querySelector('[data-field="user-page.name"] span.error');
            assert.ok(errorEl, 'Validation error is shown for name field');
        })
        .then('User name should not be "$name"', function (name) {
            let displayEl = document.querySelector('.user-name .app-ui-inline-editable__display-value');
            assert.notEqual(displayEl.textContent.trim(), name, `User name should not be changed to ${name}`);
        })
        .then('User designation should be "$designation"', function (designation) {
            assert.dom('.user-designation .app-ui-inline-editable__display-value').hasText(designation, `User designation should be ${designation}`);
        })
        .then('User timezone should be "$timezone"', function (timezone) {
            let user = server.schema.users.find(1);
            assert.equal(user.timezone, timezone, `User timezone should be ${timezone}`);
        });
}
