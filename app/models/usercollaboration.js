/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The user collaborations model.
 *
 * @class UsercollaborationModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UsercollaborationModel extends Model {

    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Usercollaboration
     * @private
     */
    @attr('string') userId;

    /**
     * Collaboration of user.
     * 
     * @property openIssues
     * @type String
     * @for Usercollaboration
     * @private
     */
    @attr('string') collaboration;
}
