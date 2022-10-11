import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on most worked member $userIndex": (assert) => async function (userIndex) {
                let user = server.schema.userworkmostwiths.find(parseInt(userIndex));
                await click(`[data-user="${user.name}"] [data-close-member="profileLink"]`);
                assert.ok(true, `User clicks on most worked member ${userIndex}`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}