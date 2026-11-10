/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The read-only counts of a conversation room, served by Gaia for many rooms in one call. The id is the room id.
 *
 * @class ConversationroomcountModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class ConversationroomcountModel extends Model {

    /**
     * Comments on the room
     *
     * @property commentCount
     * @type Number
     */
    @attr('number') commentCount;

    /**
     * Votes on the room
     *
     * @property likeCount
     * @type Number
     */
    @attr('number') likeCount;

    /**
     * Comments of a vote room with the text "I agree"
     *
     * @property agreeCount
     * @type Number
     */
    @attr('number') agreeCount;

    /**
     * Comments of a vote room with the text "I disagree"
     *
     * @property disagreeCount
     * @type Number
     */
    @attr('number') disagreeCount;

    /**
     * Date of the latest comment
     *
     * @property lastCommentDate
     * @type String
     */
    @attr('string') lastCommentDate;

    /**
     * The project of the room
     *
     * @property projectId
     * @type String
     */
    @attr('string') projectId;
}
