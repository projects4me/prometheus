/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A server that provides tools to agents: Claude Code built-ins, an MCP server or an OpenAPI service.
 *
 * @class Toolserver
 * @namespace Prometheus.Model
 * @extends DS.Model
 */
export default class ToolserverModel extends Model {
    @attr('string') name;
    @attr('string') kind;
    @attr('string') location;
    @attr('string') endpoint;
    @attr('string') transport;
    @attr('string') command;
    @attr('string') spec;
    @attr('string') description;
    @attr('string') schemaRefreshedAt;
    @attr('string') refreshError;
    @attr('boolean') refresh;
    @attr('string') dateCreated;
    @attr('string') dateModified;
}
