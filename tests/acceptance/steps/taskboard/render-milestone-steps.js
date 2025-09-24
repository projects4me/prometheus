import steps from '../steps';

export default function (assert) {
	return steps(assert)
	.given('Each issue has $hours hours and $minutes minutes of $context time', function (hours, minutes, context) {
		let issues = server.schema.issues.all()
		let timelog = server.schema.create('timelog', {	
			days: 0,
			hours: hours,
			minutes: minutes,
		})
		issues.models.forEach(issue => {
			issue.update({
				[context]: [timelog]
			});
		});
	})
	.then('User should see $hours hours and $minutes minutes of $context time of first milestone', function (hours, minutes, context) {
		let milestone = server.schema.milestones.all().models[0];
		let milestoneEl = document.querySelector(`[data-milestone-details="${milestone.id}"]`);
		let timelogEl = milestoneEl.querySelector(`[data-milestone-time="${context}"]`);
		let contextText = context === 'spent' ? 'Spent' : 'Estimated';
		assert.equal(timelogEl.innerText, `${contextText} ${hours} h ${minutes} m`);

	})
	.then(
		'User should see $issuesCount issues in $status status',
		function (issuesCount, status) {
			let statusLane = document.querySelector(
				`[data-field-status="${status}"]`
			);
			let match = statusLane.innerText.match(/\((\d+)\)/);
			assert.equal(
				match[1],
				issuesCount,
				`User should see ${issuesCount} issues in ${status}`
			);
		}
	);
}
