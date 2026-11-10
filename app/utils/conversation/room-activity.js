/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

const PREFIX = 'views.app.conversation.thread.activity';

/**
 * The translation key and values of the sentence of one conversation-room activity. Gaia records only: started
 * (`created`), subject or description edited (`updated`, context.field) and the linked issue set, changed or
 * cleared (`linked`, `unlinked`, with the issue numbers in the context).
 *
 * @method describeRoomActivity
 * @param {Object} activity An activity record or its attributes
 * @param {String} roomType `discussion` or `vote`
 * @returns {{key: String, params: Object}|null} null for a kind Gaia does not record for rooms
 */
export function describeRoomActivity(activity, roomType) {
    let context = activity?.context || {};
    let user = activity?.createdUserName || '';
    switch (activity?.type) {
        case 'created':
            return { key: `${PREFIX}.${roomType === 'vote' ? 'startedVote' : 'startedThread'}`, params: { user } };
        case 'updated':
            if (context.field === 'subject' || context.field === 'description') {
                return { key: `${PREFIX}.edited.${context.field}`, params: { user } };
            }
            return null;
        case 'linked':
            if (context.oldIssueNumber && context.newIssueNumber) {
                return { key: `${PREFIX}.changedIssue`, params: { user, from: context.oldIssueNumber, to: context.newIssueNumber } };
            }
            return { key: `${PREFIX}.linkedIssue`, params: { user, number: context.newIssueNumber ?? '' } };
        case 'unlinked':
            return { key: `${PREFIX}.unlinkedIssue`, params: { user, number: context.oldIssueNumber ?? '' } };
        default:
            return null;
    }
}

/**
 * The date label of an activity: the time for today's activities, otherwise the day and short month (DD MMM)
 *
 * @method activityDateLabel
 * @param {String} dateCreated
 * @returns {String}
 */
export function activityDateLabel(dateCreated) {
    if (!dateCreated) return '';
    let date = moment(dateCreated);
    return date.isSame(moment(), 'day') ? date.format('HH:mm') : date.format('DD MMM');
}

/**
 * The lines the Activity box renders: the sentence parts and the date label of every activity, activities of a
 * kind the box does not describe left out
 *
 * @method buildActivityLines
 * @param {Array} activities
 * @param {String} roomType
 * @returns {Array<{id: String, key: String, params: Object, date: String}>}
 */
export function buildActivityLines(activities = [], roomType) {
    let lines = [];
    for (let activity of activities) {
        let sentence = describeRoomActivity(activity, roomType);
        if (sentence) {
            lines.push({ id: activity.id, ...sentence, date: activityDateLabel(activity.dateCreated) });
        }
    }
    return lines;
}
