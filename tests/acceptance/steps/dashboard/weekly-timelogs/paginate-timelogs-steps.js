import steps from '../../steps';
import Context from '../../../../../mirage/yadda-context/context';
import DateUtils from 'prometheus/utils/date';
import Collection from 'ember-cli-mirage/orm/collection';

export default function (assert) {
	return steps(assert).given(
		'There is custom callback setup to filter timelog model',
		function () {
			let ctx = new Context();
			ctx.set('customCallback', function (issues) {
				return filterWeeklyWidgetModel('issue', issues);
			});
			assert.ok(
				true,
				'There is custom callback setup to filter timelog model'
			);
		}
	);
}

function filterWeeklyWidgetModel(modelType, collection) {
	const ctx = new Context();
	if (!ctx.get('page')) {
		ctx.set('page', 1);
	}
	let { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(
		ctx.get('page')
	);
	let models = collection.models.filter(
		(model) =>
			model.startDate <= endOfWeek && model.endDate >= startOfWeek
	);
	return new Collection(modelType, models);
}