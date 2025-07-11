import steps from '../../steps';
import Context from '../../../../../mirage/yadda-context/context';
import {
	filterWeeklyWidgetModel,
	setDateForWeeklyWidget
} from '../../common-steps/widgets';

export default function (assert) {
	return steps(assert)
		.given('$count activities are for $week week', function (count, week) {
			let activities = server.schema.activities.all();
			setDateForWeeklyWidget(activities, count, week);
			assert.ok(
				true,
				`There are ${count} activities for ${week} week`
			);
		})
		.given(
			'There is custom callback setup to filter activity model',
			function () {
				let ctx = new Context();
				ctx.set('customCallback', function (activities) {
					return filterWeeklyWidgetModel('activity', activities);
				});
				assert.ok(
					true,
					'There is custom callback setup to filter activity model'
				);
			}
		);
}
