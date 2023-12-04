import steps from '../steps';
import { currentSession, authenticateSession } from 'ember-simple-auth/test-support';
import { currentURL, visit } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "$userName is logged in": (assert, ctx) => async function (userName) {
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
                
                let user = server.schema.users.find(id);
                let userPermission = server.schema.userpermissions.find(1);
                userPermission.update({
                    userId: id
                });

                user.update({
                    aclPermissions: server.schema.userpermissions.all()
                });

                ctx.set('currentUser', user);
                assert.ok(true, "User is logged in");
            }
        },
        {
            "User is not logged in": (assert) => async function () {
                await visit('/signin');
                assert.equal(currentURL(), '/signin', "User is not logged in");
            }
        }
    ]
}

export default function (assert) {
    return steps(assert);
}