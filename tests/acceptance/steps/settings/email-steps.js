import { click, fillIn, settled } from '@ember/test-helpers';
import steps from '../steps';

const KEYS = {
    host: 'email.smtpHost',
    port: 'email.smtpPort',
    encryption: 'email.smtpEncryption',
    username: 'email.smtpUsername',
    password: 'email.smtpPassword',
    fromName: 'email.fromName',
    fromEmail: 'email.fromEmail'
};

/**
 * The value the server holds for a setting (secure values live in storedValue).
 */
function storedValue(field) {
    let setting = server.schema.settings.findBy({ name: KEYS[field] });
    return setting.secure ? setting.storedValue : setting.settingValue;
}

export const given = function () {
    return [
        {
            "The test result is $code": (assert) => async function (code) {
                server.testSettingsResult = code;
                assert.ok(true, `The test result is ${code}`);
            }
        },
        {
            "The email settings are\n$table": (assert) => async function (table) {
                let row = table[0];

                Object.entries(KEYS).forEach(([field, name]) => {
                    let secure = field === 'password';
                    let value = row[field] || null;

                    server.create('setting', {
                        name,
                        groupName: 'email',
                        secure,
                        settingValue: secure ? null : value,
                        storedValue: secure ? value : null,
                        isSet: secure && Boolean(value)
                    });
                });
                assert.ok(true, 'The email settings exist');
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User opens the test settings modal": (assert) => async function () {
                await click('[data-btn="test-email"]');
                await settled();
                assert.dom('[data-email-test-modal]').exists();
            }
        },
        {
            "User fills the test recipient with $value": (assert) => async function (value) {
                await fillIn('[data-field="test.recipient"] input', value);
                await settled();
                assert.ok(true, `User fills the recipient with ${value}`);
            }
        },
        {
            "User sends the test email": (assert) => async function () {
                await click('[data-btn="submit-test"]');
                await settled();
                assert.ok(true, 'User sends the test email');
            }
        },
        {
            "User fills the email field $field with $value": (assert) => async function (field, value) {
                await fillIn(`[data-field="setting.${field}"] input`, value);
                assert.ok(true, `User fills ${field} with ${value}`);
            }
        },
        {
            "User clears the email field $field": (assert) => async function (field) {
                await fillIn(`[data-field="setting.${field}"] input`, '');
                assert.ok(true, `User clears ${field}`);
            }
        },
        {
            "User saves the email settings": (assert) => async function () {
                await click('[data-btn="save-email"]');
                await settled();
                assert.ok(true, 'User saves the email settings');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The test recipient is the email of the logged in user": (assert, ctx) => async function () {
                assert.dom('[data-field="test.recipient"] input').hasValue(ctx.get('loggedInUser').email);
            }
        },
        {
            "The send test button is disabled": (assert) => async function () {
                assert.dom('[data-btn="submit-test"]').isDisabled();
            }
        },
        {
            "The test result shows $code in $style": (assert) => async function (code, style) {
                assert.dom(`[data-test-result="${code}"]`).hasClass(`callout-${style}`);
                assert.dom(`[data-test-result="${code}"]`).doesNotContainText('views.app.settings');
            }
        },
        {
            "The test request carried the email field $field as $value": (assert) => async function (field, value) {
                let id = server.schema.settings.findBy({ name: KEYS[field] }).id;
                let sent = server.lastSettingsTest;
                assert.true(sent.test);
                assert.equal(sent.collection.find((item) => item.id === id).settingValue, value);
                assert.equal(sent.collection.length, Object.keys(KEYS).length);
            }
        },
        {
            "The email form is still unsaved": (assert) => async function () {
                assert.dom('[data-field="setting.host"] input').hasValue('mail.other.com');
            }
        },
        {
            "The email field $field shows $value": (assert) => async function (field, value) {
                assert.dom(`[data-field="setting.${field}"] input`).hasValue(value);
            }
        },
        {
            "The email password field is empty and shows that a password is saved": (assert) => async function () {
                assert.dom('[data-field="setting.password"] input').hasValue('');
                assert.dom('[data-password-saved]').exists();
            }
        },
        {
            "The sent emails box is shown": (assert) => async function () {
                assert.dom('[data-email-sent]').exists();
            }
        },
        {
            "The email setting $field is stored as $value": (assert) => async function (field, value) {
                assert.equal(storedValue(field), value);
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
