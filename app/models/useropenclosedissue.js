/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user open/closed issue model.
 *
 * @class UseropenclosedissueModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UseropenclosedissueModel extends Model {
    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Useropenclosedissue
     * @private
     */
    @attr('string') userId;

    /**
     * Count of open issues of user.
     * 
     * @property openIssues
     * @type String
     * @for Useropenclosedissue
     * @private
     */
    @attr('string') openIssues;

    /**
     * Count of closed issues of user.
     * 
     * @property closedIssues
     * @type String
     * @for Useropenclosedissue
     * @private
     */
    @attr('string') closedIssues;
}
