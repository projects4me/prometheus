/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user most works with model.
 *
 * @class UserworkmostwithModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UserworkmostwithModel extends Model {

    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Userworkmostwith
     * @private
     */
    @attr('string') userId;

    /**
     * Name of the user.
     * 
     * @property name
     * @type String
     * @for Userworkmostwith
     * @private
     */
    @attr('string') name;

    /**
     * Title of the user.
     * 
     * @property title
     * @type String
     * @for Userworkmostwith
     * @private
     */
    @attr('string') title;
}
