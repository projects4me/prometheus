import steps from '../../steps';
import Context from '../../../../../mirage/yadda-context/context';
import { click } from '@ember/test-helpers';

export default function (assert) {
	return steps(assert)
		.given('each timelog has $hr hr time', function (hr) {
			let timelogs = server.schema.timelogs.all();
			let models = timelogs.models;

			for (let i = 0; i < timelogs.length; i++) {
				let contextValue = i < 10 ? 'spent' : 'est';
				models[i].update({
					days: 0,
					hours: hr,
					minutes: 0,
					context: contextValue
				});
			}
			assert.ok(
				true,
				'Set 5 timelogs for context "spent" and 5 for "est", each with $hr hr time'
			);
		})
		.given(
			'$count hrs are $context by logged in user on the issue',
			function (count, context) {
				let timelogs = server.schema.timelogs.all();
				let ctx = new Context();
				let user = ctx.get('loggedInUser');
				let timelogsCount = 0;
				timelogs.models.forEach((timelog) => {
					if (timelogsCount < count && timelog.context === context) {
						timelog.update({
							createdUser: user.id
						});
						timelogsCount++;
					}
				});

				// set Remaining timelogs to another user
				let anotherUser = server.schema.create('user', {
					id: '2',
					name: 'User 2'
				});

				for (let i = count; i < timelogs.length; i++) {
					if (timelogs.models[i].context === context) {
						timelogs.models[i].update({
							createdUser: anotherUser.id
						});
					}
				}
			}
		)
		.when('User filters timelogs by my timelogs', async function () {
			await click('[data-filter-name="myTimeLogs"]');
			assert.ok(true, 'User filters timelogs by my timelogs');
		})
		.then('There should be 1 timelog present with $count spent hrs', function (count) {
			assert.dom('[data-spent-time] b').hasText(`${count} h`);
		});
}
