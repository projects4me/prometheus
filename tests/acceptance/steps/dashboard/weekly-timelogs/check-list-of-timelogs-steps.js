import steps from '../../steps';

export default function (assert) {
	return steps(assert)
		.then(
			'There should be 1 timelogs present in weekly timelogs widget with spent 0 and estimated 0',
			function () {
				assert.dom('[data-spent-time] b').hasText('0 h');
				assert.dom('[data-estimated-time] b').hasText('0 h');
			}
		);
}
