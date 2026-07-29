import steps from '../steps';

export default function (assert) {
    return steps(assert)
        .given(
            'User $userId is a project $projectId member with account status $status',
            async function (userId, projectId, status) {
                let user = server.schema.users.find(parseInt(userId, 10));
                let project = server.schema.projects.find(parseInt(projectId, 10));

                user.update({ accountStatus: status });

                let members = project.members.add(user);
                project.update({ members: members });

                server.create('membership', {
                    project: project,
                    projectId: String(projectId),
                    userId: String(userId),
                    modifiedUser: parseInt(userId, 10)
                });

                assert.ok(
                    true,
                    `User ${userId} is a project ${projectId} member with account status ${status}`
                );
            }
        )
        .then(
            'Project member $memberId shows account status $status',
            async function (memberId, status) {
                assert
                    .dom(
                        `[data-member-id="${memberId}"] .member-account-status-${status}`
                    )
                    .exists(
                        `Project member ${memberId} shows account status ${status}`
                    );
                assert
                    .dom(
                        `[data-member-id="${memberId}"] .member-account-status-${status}`
                    )
                    .hasText(
                        status.charAt(0).toUpperCase() + status.slice(1),
                        `Project member ${memberId} status text is ${status}`
                    );
            }
        );
}
