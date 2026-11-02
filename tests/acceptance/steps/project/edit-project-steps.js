import steps from '../steps';

export default function (assert) {
	return steps(assert)
    .given('Project $shortCode is managed by $userName', function (shortCode, userName) {
        // The factory picks a random manager; saving goes to the project page when it is the current user
        let user = server.schema.users.findBy({ name: userName });
        let project = server.schema.projects.findBy({ shortCode });
        project.update({ projectManager: user.id });
        assert.strictEqual(project.projectManager, user.id, `Project ${shortCode} is managed by ${userName}`);
    })
    .then('Project name is $expectedProjectName in list view', function (expectedProjectName) {
        assert.dom('.projects .project-name a').hasText(expectedProjectName);
    })
    .then('Project description is $expectedProjectDescription in list view', function (expectedProjectDescription) {
        assert.dom('.projects .project-description').hasText(expectedProjectDescription);
    })
}
