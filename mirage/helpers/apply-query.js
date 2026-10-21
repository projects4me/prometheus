/**
 * Filters a collection by the `(Resource.field : value)` conditions of the request's query
 * parameter, the only form the idea screens send.
 *
 * @param {Collection} collection
 * @param {Object} request
 * @returns {Collection}
 */
export default function applyQuery(collection, request) {
	let query = request.queryParams.query || '';
	let conditions = [...query.matchAll(/\w+\.(\w+) : ([^\s)]+)/g)];
	return collection.filter(record => conditions.every(([, field, value]) => String(record[field]) === value));
}
