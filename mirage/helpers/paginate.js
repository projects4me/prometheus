import Collection from 'ember-cli-mirage/orm/collection';

/**
 * This function paginates a mirage collection based on the query parameters.
 *
 * @param {Collection} collection - The mirage collection to paginate.
 * @param {Object} queryParams - The query parameters.
 * @param {number} queryParams.page - The page number.
 * @param {number} queryParams.limit - The limit of items per page.
 * @returns {Collection} The paginated mirage collection.
 */
export default function paginate(collection, queryParams) {
	const { page, limit } = queryParams;
	if (limit !== undefined && limit !== '-1') {
		const pageNum = page ? parseInt(page, 10) : 1;
		const limitNum = parseInt(limit, 10);
		const start = (pageNum - 1) * limitNum;
		const end = start + limitNum;
		const models = collection.models.slice(start, end);
		const modelName = collection.modelName;
		return new Collection(modelName, models);
	}
	return collection;
}
