import steps from '../steps';

export default function (assert) {
	return steps(assert).then(
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
