/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user open/closed project model.
 *
 * @class UseropenclosedprojectModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UseropenclosedprojectModel extends Model {
    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Useropenclosedproject
     * @private
     */
    @attr('string') userId;

    /**
     * Count of open projects of user.
     * 
     * @property openProjects
     * @type String
     * @for Useropenclosedproject
     * @private
     */
    @attr('string') openProjects;

    /**
     * Count of closed projects of user.
     * 
     * @property closedProjects
     * @type String
     * @for Useropenclosedproject
     * @private
     */
    @attr('string') closedProjects;
}
