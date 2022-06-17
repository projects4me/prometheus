/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * The Scoreboard model
 *
 * @class ScoreboardModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class ScoreboardModel extends Model {

    /**
     * The id of user whom score is stored in scoreboard.
     *
     * @property userId
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') userId;

    /**
     * The identifier of badge.
     *
     * @property badgeId
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') badgeId;

    /**
     * The score of the user on behalf of a badge.
     *
     * @property score
     * @type Number
     * @for Scoreboard
     * @private
     */
    @attr('number') score;

    /**
     * The date on which the scoreboard was created.
     *
     * @property dateCreated
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the scoreboard was last modified.
     *
     * @property dateModified
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') dateModified;

    /**
     * The soft deletion flag of the scoreboard.
     *
     * @property deleted
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') deleted;

    /**
     * The identifier of the user who created the scoreboard.
     *
     * @property createdUser
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the scoreboard.
     *
     * @property createdUserName
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the scoreboard.
     *
     * @property modifiedUser
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the scoreboard.
     *
     * @property modifiedUserName
     * @type String
     * @for Scoreboard
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The level of badge, earned by user.
     *
     * @property userBadges
     * @type badgelevel
     * @for Scoreboard
     * @private
     */
    @belongsTo('badgelevel') userBadgeLevel;

    /**
     * The badge of the user.
     *
     * @property badges
     * @type badgelevel
     * @for Scoreboard
     * @private
     */
    @belongsTo('badge') userBadge;
}
