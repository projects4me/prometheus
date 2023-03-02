/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user latest project model.
 *
 * @class UserlatestprojectModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserlatestprojectModel extends Model {

    /**
     * Name of project.
     * 
     * @property name
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') name;

    /**
     * Status of project.
     * 
     * @property status
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') status;

    /**
     * Description of project.
     * 
     * @property description
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') description;

    /**
     * Short code of project.
     * 
     * @property shortCode
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') shortCode;

    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') userId;

    /**
     * Total issues of that project.
     * 
     * @property totalIssues
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') totalIssues;

    /**
     * Count of closed issues of user.
     * 
     * @property closedIssues
     * @type String
     * @for Userlatestproject
     * @private
     */
    @attr('string') closedIssues;

    /**
     * This property tells the completion of project
     * in percentage.
     * 
     * @property completionPercentage
     * @type String
     * @for Userlatestproject
     * @private
     */
    get completionPercentage() {
        let openIssues = this.totalIssues - this.closedIssues;
        let percentage = (openIssues != 0) ? Math.ceil(((this.totalIssues - openIssues) / this.totalIssues) * 100) : 0;
        return percentage;
    }
}
