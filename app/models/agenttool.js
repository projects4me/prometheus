/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A grant of one tool, or of a whole tool server, to an agent. The permission rule narrows what the agent may do with it, such as `dev-tools/ai/ai:*` for Bash.
 *
 * @class Agenttool
 * @namespace Prometheus.Model
 * @extends DS.Model
 */
export default class AgenttoolModel extends Model {
    @attr('string') agentId;
    @attr('string') toolId;
    @attr('string') toolServerId;
    @attr('string') permissionRule;
    @attr('string') dateCreated;
}
