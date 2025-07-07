import steps from '../../steps';
import {
	filterWeeklyWidgetModel,
	setDateForWeeklyWidget
} from '../../common-steps/widgets';
import Context from '../../../../../mirage/yadda-context/context';

export default function (assert) {
	return steps(assert)
		.given(
			'There is custom callback setup to filter timelog model',
			function () {
				let ctx = new Context();
				ctx.set('customCallback', function (timelogs) {
					return filterWeeklyWidgetModel('timelog', timelogs);
				});
				assert.ok(
					true,
					'There is custom callback setup to filter timelog model'
				);
			}
		)
		.given('$count timelogs are for $week week', function (count, week) {
			let timelogs = server.schema.timelogs.all();
			setDateForWeeklyWidget(timelogs, count, week);
			assert.ok(
				true,
				'There are $count timelogs for $week week',
				count,
				week
			);
		});
}
