import steps from '../steps';
import { typeIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User types $userName in search box": (assert, ctx) => async function (userName) {
                ctx.set('fieldSearched', 'User.name');
                await typeIn('[data-module="user-management"] input', userName);
                assert.ok(true, `User types ${userName} in search box`);
                ctx.set('fieldSearched', null);
            }
        }
    ];
}

export const then = function () {
  return [
      {
          "$userName should be present inside list": (assert) => async function (userName) {
              assert.dom('[data-user-field="name"]').hasText(userName);
          }
      }
  ];
}

export default function (assert) {
    return steps(assert);
}