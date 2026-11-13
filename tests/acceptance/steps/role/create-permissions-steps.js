import steps from '../steps';
import { click, settled } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import $ from 'jquery';

const ACTION_LABELS = { '1': 'Allow', '0': 'None' };
const FIELD_LABELS = { none: 'None', read: 'Read Only', write: 'Write + Read' };

export default function (assert) {
    return steps(assert)
        .when('User sets action permission $resourceName to $allowed', async function (resourceName, allowed) {
            let selector = `[data-role="permission-actions"] [data-field="action-${resourceName}"] .input-group`;
            assert.ok(document.querySelector(selector), `Action permission select for ${resourceName} exists`);
            await selectChoose(selector, ACTION_LABELS[allowed] ?? allowed);
            await settled();
            assert.ok(true, `User sets action permission ${resourceName} to ${allowed}`);
        })
        .when('User opens fields permissions tab', async function () {
            let $tab = $('[data-role="permissions"] a[href="#role-permission-fields"]');
            assert.ok($tab.length, 'Fields permissions tab link exists');
            await new Promise((resolve) => {
                $tab.one('shown.bs.tab', () => resolve());
                $tab.tab('show');
            });
            await settled();
            assert.ok(
                document.querySelector('#role-permission-fields.active, #role-permission-fields.in.active'),
                'Fields permissions tab pane is active'
            );
            assert.ok(true, 'User opens fields permissions tab');
        })
        .when('User sets field $field access to $mode', async function (field, mode) {
            let selector = `[data-role="permission-fields"] [data-field="field-access-issue.${field}"] .input-group`;
            assert.ok(document.querySelector(selector), `Field access select for ${field} exists`);
            await selectChoose(selector, FIELD_LABELS[mode] ?? mode);
            await settled();
            assert.ok(true, `User sets field ${field} access to ${mode}`);
        })
        .when('User saves role permissions', async function () {
            await click('[data-role="role-permissions"] [data-btn="save"]');
            assert.ok(true, 'User saves role permissions');
        })
        .then('Action permission $resourceName is created for role $roleId with allowed $allowed', function (resourceName, roleId, allowed) {
            let permission = server.schema.permissions.where({
                resourceName,
                roleId: String(roleId)
            }).models[0];

            assert.ok(permission, `Permission ${resourceName} exists for role ${roleId}`);
            assert.strictEqual(
                String(permission.allowed),
                String(allowed),
                `Permission ${resourceName} allowed is ${allowed}`
            );
        })
        .then('Field permission $resourceName is created for role $roleId with mode $mode', function (resourceName, roleId, mode) {
            let permission = server.schema.permissions.where({
                resourceName,
                roleId: String(roleId)
            }).models[0];

            assert.ok(permission, `Field permission ${resourceName} exists for role ${roleId}`);
            assert.strictEqual(
                String(permission.allowed),
                String(mode),
                `Field permission ${resourceName} mode is ${mode}`
            );
        })
        .then('Field $resourceName triples for role $roleId are get $getFlag create $createFlag update $updateFlag', function (resourceName, roleId, getFlag, createFlag, updateFlag) {
            let expected = {
                get: String(getFlag),
                create: String(createFlag),
                update: String(updateFlag)
            };

            ['get', 'create', 'update'].forEach((action) => {
                let triple = server.schema.permissions.where({
                    resourceName: `${resourceName}.${action}`,
                    roleId: String(roleId)
                }).models[0];

                assert.ok(triple, `Field triple ${resourceName}.${action} exists for role ${roleId}`);
                assert.strictEqual(
                    String(triple.allowed),
                    expected[action],
                    `Field triple ${resourceName}.${action} allowed is ${expected[action]}`
                );
            });
        })
        .then('Field $field access mode is $mode', function (field, mode) {
            let row = document.querySelector(
                `[data-role="permission-fields"] [data-permission-module="issue"] [data-field-group="${field}"]`
            );
            assert.ok(row, `Field row for ${field} exists`);
            assert.strictEqual(
                row.getAttribute('data-field-access'),
                mode,
                `Field ${field} access mode is ${mode}`
            );
        })
        .then('Permission update success message is shown', function () {
            let messageEl = document.querySelector(
                'ul.messenger div.message-success div.messenger-message-inner'
            );
            assert.ok(messageEl, 'Permission success messenger exists');
            assert.ok(
                messageEl.textContent.includes('Permissions Updated'),
                'Permission update success message is shown'
            );
        });
}
