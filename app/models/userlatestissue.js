/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user latest issue model.
 *
 * @class UserlatestissueModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UserlatestissueModel extends Model {

    /**
     * Subject of issue.
     * 
     * @property subject
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') subject;

    /**
     * Number of issue.
     * 
     * @property issueNumber
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') issueNumber;

    /**
     * Short code of the project on which issue is created.
     * 
     * @property projectShortCode
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') projectShortCode;

    /**
     * Status of issue.
     * 
     * @property status
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') status;

    /**
     * Creation date of issue.
     * 
     * @property dateCreated
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Last Activity date occured on that issue by a user.
     * 
     * @property lastActivityDate
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') lastActivityDate;

    /**
     * Identifier of user who created issue.
     * 
     * @property userId
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') userId;

    /**
     * Identifier of project for which issue is created.
     * 
     * @property projectId
     * @type String
     * @for Userlatestissue
     * @private
     */
    @attr('string') projectId;
}
