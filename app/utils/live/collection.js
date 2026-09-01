/**
 * Helpers for live list and hasMany patches.
 */

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
 * Append a record to a hasMany / MutableArray if it is not already there.
 *
 * @method pushIfMissing
 * @param {Object} list hasMany or MutableArray
 * @param {Object} record Record to append
 * @returns {void}
 * @public
 */
export function pushIfMissing(list, record) {
    if (!list || !record) {
        return;
    }
    if (typeof list.includes === 'function' && list.includes(record)) {
        return;
    }
    if (typeof list.findBy === 'function' && list.findBy('id', record.id)) {
        return;
    }
    if (typeof list.pushObject === 'function') {
        list.pushObject(record);
    }
}

/**
 * Remove a record by id from a hasMany / MutableArray.
 *
 * @method removeById
 * @param {Object} list hasMany or MutableArray
 * @param {String} id Record id to remove
 * @returns {void}
 * @public
 */
export function removeById(list, id) {
    if (!list || !id) {
        return;
    }
    let record = typeof list.findBy === 'function' ? list.findBy('id', id) : null;
    if (record && typeof list.removeObject === 'function') {
        list.removeObject(record);
    }
}
