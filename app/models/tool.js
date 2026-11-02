/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A tool offered by a tool server, as listed by it.
 *
 * @class Tool
 * @namespace Prometheus.Model
 * @extends DS.Model
 */
export default class ToolModel extends Model {
    @attr('string') name;
    @attr('string') description;
    @attr('string') inputSchema;
    @attr('string') toolServerId;
    @attr('string') dateCreated;
    @attr('string') dateModified;
}
