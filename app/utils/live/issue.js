/**
 * Helpers for applying live issue-page events onto the open issue.
 */

/**
 * Whether the domain event is about the open issue.
 *
 * @method isOpenIssueEvent
 * @param {Object} issue The open issue record
 * @param {Object} envelope Domain-event envelope
 * @returns {Boolean}
 * @public
 */
export function isOpenIssueEvent(issue, envelope) {
    let id = envelope?.resource?.id;
    return Boolean(issue && id && String(id) === String(issue.id));
}

/**
 * Whether the comment event belongs to the conversation room of the open issue.
 *
 * @method isIssueRoomEvent
 * @param {Object} issue The open issue record
 * @param {Object} envelope Domain-event envelope
 * @returns {Boolean}
 * @public
 */
export function isIssueRoomEvent(issue, envelope) {
    let roomId = envelope?.meta?.conversationId || envelope?.changes?.relatedId;
    let issueRoomId = issue?.conversationRoomId;
    return Boolean(roomId && issueRoomId && envelope.resource?.id && String(roomId) === String(issueRoomId));
}

/**
 * The status name carried by an issue.status.changed envelope, looked up by id when only the id is sent.
 *
 * @method resolveStatusName
 * @param {Object} changes Envelope changes
 * @param {Array} statuses The project's issue statuses
 * @returns {String|undefined}
 * @public
 */
export function resolveStatusName(changes, statuses) {
    if (changes?.status) {
        return changes.status;
    }
    if (changes?.statusId === undefined || changes?.statusId === null) {
        return undefined;
    }
    return statuses?.find(item => String(item.id) === String(changes?.statusId))?.name;
}

/**
 * Find a record in the store, loading it when it is not there yet.
 *
 * @method findOrLoad
 * @param {Object} store Ember Data store
 * @param {String} type Ember Data model name
 * @param {String} id Record id
 * @returns {Promise|Object}
 * @public
 */
export function findOrLoad(store, type, id) {
    return store.peekRecord(type, id) || store.findRecord(type, id);
}
