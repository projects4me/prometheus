/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { DEFAULT_ORDER, DEFAULT_PAGE } from 'prometheus/utils/conversation/browser-defaults';

/**
 * The request, sort and group definitions of the thread browser's QuickList, as pure functions
 *
 * @module Utils.Conversation
 */

/**
 * The key of the group of the threads without a milestone
 *
 * @property NO_MILESTONE
 * @type String
 */
export const NO_MILESTONE = 'none';

/**
 * The options of the thread list query (without the limit, which the ListLoader adds): the threads of the project
 * narrowed by the search, with the creator and the linked issue, the hasOne relations the rows need. Comments and
 * votes are never loaded for the list.
 *
 * @method buildConversationListRequest
 * @param {String} projectId
 * @param {Object} [values] The query, page, sort and order params of the browser
 * @returns {Object}
 */
export function buildConversationListRequest(projectId, values = {}) {
    let conditions = [`(Conversationroom.projectId : ${projectId})`];
    if (values.query) {
        conditions.push(`(${values.query})`);
    }
    return {
        query: conditions.length > 1 ? `(${conditions.join(' AND ')})` : conditions[0],
        rels: 'createdBy,issue',
        sort: values.sort,
        order: values.order || DEFAULT_ORDER,
        page: values.page || DEFAULT_PAGE
    };
}

/**
 * The sort options of the list menu
 *
 * @method buildSortOptions
 * @param {Object} intl The intl service
 * @returns {Array}
 */
export function buildSortOptions(intl) {
    return [
        { key: 'Conversationroom.dateModified', label: intl.t('views.app.conversation.browser.sort.dateModified') },
        { key: 'Conversationroom.dateCreated', label: intl.t('views.app.conversation.browser.sort.dateCreated') },
        { key: 'Conversationroom.subject', label: intl.t('views.app.conversation.browser.sort.subject') }
    ];
}

/**
 * The group options of the list menu: by the milestone of the linked issue (names looked up in `milestones`) or by
 * the type of the thread
 *
 * @method buildGroupOptions
 * @param {Object} deps
 * @param {Object} deps.intl The intl service
 * @param {Object} deps.milestones The milestone names by milestone id
 * @returns {Array}
 */
export function buildGroupOptions({ intl, milestones }) {
    return [
        { key: 'none', label: intl.t('views.app.conversation.browser.group.none') },
        {
            key: 'milestone',
            label: intl.t('views.app.conversation.browser.group.milestone'),
            groupKey: conversation => milestoneKey(conversation, milestones),
            groupLabel: key => key === NO_MILESTONE ? intl.t('views.app.conversation.browser.noMilestone') : milestones[key]
        },
        {
            key: 'roomType',
            label: intl.t('views.app.conversation.browser.group.roomType'),
            groupKey: conversation => conversation.roomType,
            groupLabel: key => intl.t(`views.app.conversation.browser.type.${key}`)
        }
    ];
}

/**
 * The group key of a thread by milestone: the milestone id of its linked issue, or the no-milestone key when it has
 * no issue or the issue has no known milestone
 *
 * @method milestoneKey
 * @param {Object} conversation
 * @param {Object} milestones The milestone names by milestone id
 * @returns {String}
 */
export function milestoneKey(conversation, milestones) {
    let milestoneId = conversation.belongsTo('issue').value()?.milestoneId;
    return milestoneId && milestones[milestoneId] ? String(milestoneId) : NO_MILESTONE;
}

/**
 * The listed threads in the order QuickList shows them: grouped by milestone, the threads of each milestone together
 * in the order of the milestones and the threads without a milestone last. Other groupings keep the loaded order.
 * The first row of this order is the thread the browser opens by default.
 *
 * @method arrangeConversations
 * @param {Array} conversations The loaded page
 * @param {Object} deps
 * @param {String} deps.group The active grouping
 * @param {Object} deps.milestones The milestone names by milestone id, in the order of the milestones
 * @returns {Array}
 */
export function arrangeConversations(conversations, { group, milestones }) {
    if (group !== 'milestone') {
        return conversations;
    }
    let order = [...Object.keys(milestones), NO_MILESTONE];
    let rank = conversation => order.indexOf(milestoneKey(conversation, milestones));
    return conversations
        .map((conversation, index) => ({ conversation, index }))
        .sort((a, b) => rank(a.conversation) - rank(b.conversation) || a.index - b.index)
        .map(entry => entry.conversation);
}
