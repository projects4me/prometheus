import steps from '../../steps';
import { setDateForWeeklyWidget } from '../../common-steps/widgets';
import Context from '../../../../../mirage/yadda-context/context';
import { click } from '@ember/test-helpers';

export default function (assert) {
	return steps(assert)
		.given('20 timelogs are for this week', function () {
			let timelogs = server.schema.timelogs.all();
			setDateForWeeklyWidget(timelogs, 20, 'this week');
			assert.ok(true, '20 timelogs are for this week');
		})
		.given('$count timelogs are for logged in user', function (count) {
			let timelogs = server.schema.timelogs.all();
			let ctx = new Context();
			let user = ctx.get('loggedInUser');
			let models = timelogs.models;
			for (let i = 0; i < count; i++) {
				models[i].update({
					createdUser: user.id
				});
			}
			let otherUser = server.schema.create('user', {
				id: '2',
				name: 'Other User'
			});
			// set other timelogs to other user
			for (let i = count; i < timelogs.length; i++) {
				models[i].update({
					createdUser: otherUser.id
				});
			}
			assert.ok(true, '$count timelogs are for logged in user');
		})
		.when('User filters timelogs by my timelogs', async function () {
			await click('[data-filter-name="myTimeLogs"]');
		});
}
