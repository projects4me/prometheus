import steps from '../steps';

export default function (assert) {
	return steps(assert)
    .then('Project name is $expectedProjectName in list view', function (expectedProjectName) {
        assert.dom('.projects .project-name a').hasText(expectedProjectName);
    })
    .then('Project description is $expectedProjectDescription in list view', function (expectedProjectDescription) {
        assert.dom('.projects .project-description').hasText(expectedProjectDescription);
    })
}
