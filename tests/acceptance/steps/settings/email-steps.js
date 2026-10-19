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
