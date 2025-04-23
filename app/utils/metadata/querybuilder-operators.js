/**
 * Default operators available for different filter types in the query builder.
 * @property {string[]} string - Operators available for string type filters.
 * @property {string[]} date - Operators available for date type filters.
 * @description This object defines the available comparison operators for each filter type 
 * in the jquery query builder.
 */
export default {
	string: ['equal', 'not_equal', 'contains'],
	date: [
		'equal',
		'not_equal',
		'less',
		'less_or_equal',
		'greater',
		'greater_or_equal',
		'between',
		'not_between'
	]
};
