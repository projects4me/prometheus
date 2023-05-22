/**
 * This function apply limit on the collection of models.
 * 
 * @param {String} limit 
 * @param {Array} model
 * @param {String} page 
 * @returns array
 */

export default function limtModel(limit, model, page) {
    if (limit !== '-1' && !_.isEmpty(limit)) {
        let lowerBound = (page > 1) ? ((page - 1) * limit) : 0;
        let upperBound = limit * page;
        model.models = _.slice(model.models, lowerBound, upperBound);
    }
    return model;
}