import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import _ from 'lodash';
import steps from './steps';
import { currentSession, authenticateSession } from 'ember-simple-auth/test-support';

export const given = function () {
    return [{
        "$userName is logged in": (assert) => async function (userName) {
            let id = userName.slice(-1);
            server["customUser"] = (schema) => {
                return schema.users.find(id);
            }
            let session = currentSession();
            if (!session.isAuthenticated) {
                await authenticateSession({
                    authToken: '12345',
                });
            }
            await visit('/app');
            assert.ok(true, "User is logged in");
        }
    }]
}

export default function (assert) {
    return steps(assert);
}