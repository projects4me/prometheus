/**
 * Helpers for live list and hasMany patches.
 */
import { notifyPropertyChange } from '@ember/object';
import { isPromiseManyArray } from 'prometheus/utils/array/to-array';

/**
 * Return a peeked record, or push a stub from changed attrs when creating.
 *
 * @method peekOrPush
 * @param {Object} store Ember Data store
 * @param {String} modelName Ember Data model name
 * @param {String} id Record id
 * @param {Object} attributes Attributes to set or push
 * @returns {Object|null}
 * @public
 */
export function peekOrPush(store, modelName, id, attributes) {
    let record = store.peekRecord(modelName, id);
    if (record) {
        if (attributes && Object.keys(attributes).length) {
            record.setProperties(attributes);
        }
        return record;
    }
    return store.push({
        data: {
            id: String(id),
            type: modelName,
            attributes: attributes || {}
        }
    });
}

/**
 * The array behind a list: the list itself, or the loaded ManyArray of an async hasMany's PromiseManyArray.
 * Ember Data 4.12 deprecates the Ember Array methods on its arrays (gone in 5.0), so lists change natively.
 *
 * @method items
 * @param {Object} list An array, a record array or a PromiseManyArray
 * @return {Array|undefined} The array, undefined when there is none
 * @private
 */
function items(list) {
    let target = isPromiseManyArray(list) ? list.content : list;
    return Array.isArray(target) ? target : undefined;
}

/**
 * Insert a record at index when no item with the same id is present.
 *
 * @method insertAtIfMissing
 * @param {Object} list An array, a record array or a PromiseManyArray
 * @param {Object} record Record to insert
 * @param {Number} index Target index
 * @return {Boolean} True when the record was inserted
 * @public
 */
export function insertAtIfMissing(list, record, index) {
    let target = items(list);
    if (!target || !record || target.find((item) => item.id === record.id)) {
        return false;
    }
    target.splice(index, 0, record);
    notifyPropertyChange(target, '[]');
    return true;
}

/**
 * Append a record to a list if it is not already there.
 *
 * @method pushIfMissing
 * @param {Object} list An array, a record array or a PromiseManyArray
 * @param {Object} record Record to append
 * @public
 */
export function pushIfMissing(list, record) {
    let target = items(list);
    if (!target || !record || target.includes(record) || target.find((item) => item.id === record.id)) {
        return;
    }
    target.push(record);
    notifyPropertyChange(target, '[]');
}

/**
 * Remove a record by id from a list.
 *
 * @method removeById
 * @param {Object} list An array, a record array or a PromiseManyArray
 * @param {String} id Record id to remove
 * @public
 */
export function removeById(list, id) {
    let target = items(list);
    let index = target && id ? target.findIndex((item) => item.id === id) : -1;
    if (index > -1) {
        target.splice(index, 1);
        notifyPropertyChange(target, '[]');
    }
}

