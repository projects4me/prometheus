/**
 * This function push object into model.
 * 
 * @param {Object} model 
 * @param {Object} object
 * @returns object
 */
 export default function pushObjectInModel(model, object) {
    model.models.length = 0;
    model.models.pushObject(object);
}