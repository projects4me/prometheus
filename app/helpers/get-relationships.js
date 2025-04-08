import { helper } from '@ember/component/helper';
import { getModelRelationships } from 'prometheus/utils/model/relationship';

/**
 * A helper function that retrieves relationships for a given model.
 *
 * @author Rana Nouman <ranamnouman@gmail.com>
 * @method getRelationships
 * @param {Array} params - The parameters array
 * @param {string} params[0] - modelName - The name of the model whose relationships are to be retrieved
 * @param {Object} params[1] - store - The store object to query for relationships
 * @param {string|null} params[2] - kind - The kind of relationships to retrieve, defaults to null (all kinds)
 * @return {Array|Object} - The relationships for the specified model
 */
export default helper(function getRelationships([
	modelName,
	store,
	kind = null
]) {
	const relationships = getModelRelationships(modelName, store, kind, false);
	const translatedRelationships = relationships.map((relationship) => {
		return {
			label: relationship.translatedName,
			value: relationship.name
		};
	});
	return translatedRelationships;
});
