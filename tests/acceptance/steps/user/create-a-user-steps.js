import steps from '../steps';
import { fillIn, click } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';
import Collection from 'ember-cli-mirage/orm/collection';

export const when = function () {
    return [
        {
            "User enters following details for a user\n$table": (assert) => async function (table) {
                for (const [key, value] of Object.entries(table[0])) {
                    await fillIn(`[data-field="user.${key}"] input`, value);
                    assert.ok(true, `User ${key} entered`);
                }
            }
        },
        {
            "User selects date of birth": (assert) => async function () {
                await click(`div[data-field="user.dateOfBirth"] > input.ember-text-field`);
                let dateOfBirthEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr:nth-child(3) td');
                await click(dateOfBirthEl);
                assert.ok(true, "Date of birth selected");
            }
        },
        {
            "There is custom callback for user": (assert) => async function () {
                let ctx = new Context();
                ctx.set('userCustomCallback', function (users, userQuery) {
                    if(userQuery.includes('ranamnouman@gmail.com')) {
                        return new Collection('user', []);
                    }
                    return users;
                });
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}