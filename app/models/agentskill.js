/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A grant of one skill to an agent.
 *
 * @class Agentskill
 * @namespace Prometheus.Model
 * @extends DS.Model
 */
export default class AgentskillModel extends Model {
    @attr('string') agentId;
    @attr('string') skillId;
    @attr('string') dateCreated;
}
