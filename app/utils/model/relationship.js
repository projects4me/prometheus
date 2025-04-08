/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { getOwner } from '@ember/application';

/**
 * Extracts relationship information from a model
 *
 * @author Rana Nouman <ranamnouman@gmail.com>
 * @method getModelRelationships
 * @param {String} modelName - Name of the model
 * @param {Object} store - The Ember Data store
 * @param {String} [kind] - Optional filter by relationship kind ('belongsTo' or 'hasMany')
 * @param {boolean} [translate] - Whether to translate the relationships, defaults to false
 * @return {Array} Array of relationship names or objects
 * @public
 */
export function getModelRelationships(modelName, store, kind = null, translate = false) {
	const relationships = [];

	let intl = null;
	if (translate) {
		intl = getOwner(store).lookup('service:intl');
	}
	
	store.modelFor(modelName).eachRelationship((name, descriptor) => {
		if (!kind || descriptor.kind === kind) {
			if (translate && intl) {
				const translationKey = `global.module.${modelName.toLowerCase()}.relationships.${name}`;
				const translatedName = intl.t(translationKey);
				relationships.push({
					name: name,
					translatedName: translatedName
				});
			} else {
				relationships.push(name);
			}
		}
	});

	return relationships;
}

// Usage examples:
// Get all relationships: getModelRelationships(store, 'project')
// Get only belongsTo: getModelRelationships(store, 'project', 'belongsTo')
// Get only hasMany: getModelRelationships(store, 'project', 'hasMany')
