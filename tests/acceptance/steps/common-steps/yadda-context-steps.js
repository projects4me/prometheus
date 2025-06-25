import steps from '../steps';

export const given = function () {
	return [
		{
			'There is need to paginate the $modelType': (assert, ctx) =>
				async function (modelType) {
					modelType = _.capitalize(modelType);
					ctx.set(`paginate${modelType}`, true);
					assert.ok(
						true,
						`There is need to paginate the ${modelType}`
					);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
