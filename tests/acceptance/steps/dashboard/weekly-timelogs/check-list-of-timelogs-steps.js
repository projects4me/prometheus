import steps from '../../steps';

export default function (assert) {
	return steps(assert).given(
		'10 timelogs are added in only one issue for project $projectId',
		function (projectId) {
			let timelogs = server.schema.timelogs.all();
			let project = server.schema.projects.find(projectId);
			let issue = server.schema.create('issue', {
				projectId: project.id,
				issueTypeId: 1,
				subject: 'Test Issue',
				description: 'Test Description',
				status: 'Open',
				issueNumber: 1,
				projectShortcode: project.shortcode
			});
			timelogs.models.forEach((model) => {
				model.update({
					issueId: issue.id,
					projectShortcode: project.shortCode,
					issue: issue
				});
			});
		}
	);
}
