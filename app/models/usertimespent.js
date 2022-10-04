/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user time spent on issues model.
 *
 * @class UsertimespentModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UsertimespentModel extends Model {
    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Usertimespent
     * @private
     */
     @attr('string') userId;

     /**
      * Total time spent by user on issues.
      * 
      * @property totalMinutes
      * @type String
      * @for Usertimespent
      * @private
      */
     @attr('string') totalMinutes;
}
