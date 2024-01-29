/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The Systemsetting model
 *
 * @class SystemsettingModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class SystemsettingModel extends Model {

    /**
     * This contains all of the acl settings.
     * 
     * @property aclSettings
     * @type Json
     * @for SystemsettingModel
     * @private
     */
    @attr('json') aclSettings;
}
