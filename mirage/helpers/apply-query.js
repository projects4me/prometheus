/**
 * Filters a collection by the `(Resource.field : value)` conditions of the request's query
 * parameter, the only form the idea screens send. Conditions on different fields all have to hold,
 * several conditions on one field (`(A.f : 1) OR (A.f : 2)`) hold when any of them does.
 *
 * @param {Collection} collection
 * @param {Object} request
 * @returns {Collection}
 */
export default function applyQuery(collection, request) {
	let query = request.queryParams.query || '';
	let accepted = {};
	for (let [, field, value] of query.matchAll(/\w+\.(\w+) : ([^\s)]+)/g)) {
		accepted[field] = accepted[field] || [];
		accepted[field].push(value);
	}
	return collection.filter(record => Object.entries(accepted).every(([field, values]) => values.includes(String(record[field]))));
}
