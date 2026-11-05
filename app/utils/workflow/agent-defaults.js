/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The settings a Run agent step starts with when an agent is picked. All values are strings, as Gaia types every
 * Run agent setting. The model is not one of them: an empty model lets the runtime pick by the issue's complexity.
 *
 * @class AgentDefaults
 * @namespace Prometheus.Utils.Workflow
 */

/**
 * The minutes a run waits for the agent to pick it up; Gaia's RunAgentActor::CLAIM_MINUTES
 *
 * @property CLAIM_TIMEOUT
 * @type String
 * @public
 */
export const CLAIM_TIMEOUT = '15';

/**
 * The minutes a run may take; Gaia's RunAgentActor::FINISH_MINUTES
 *
 * @property TIMEOUT
 * @type String
 * @public
 */
export const TIMEOUT = '240';

const isBlank = value => value === undefined || value === null || value === '';

/**
 * The defaults an agent gives a Run agent step
 *
 * @method agentDefaults
 * @param {Agent} agent the Agent record, or nothing
 * @return {Object} the defaults, empty when there is no agent
 * @public
 */
export function agentDefaults(agent) {
    if (!agent) {
        return {};
    }
    let defaults = { session: 'new', claimTimeout: CLAIM_TIMEOUT, timeout: TIMEOUT };
    if (!isBlank(agent.maxTurns)) {
        defaults.maxTurns = String(agent.maxTurns);
    }
    return defaults;
}

/**
 * Fills the settings that are empty or still hold the previous agent's default; a value the user typed stays.
 *
 * @method fillAgentDefaults
 * @param {Object} config the draft
 * @param {Agent} previous the agent picked before, or nothing
 * @param {Agent} agent the agent now picked, or nothing
 * @return {Object} a new draft
 * @public
 */
export function fillAgentDefaults(config, previous, agent) {
    let before = agentDefaults(previous);
    let next = { ...config };
    Object.entries(agentDefaults(agent)).forEach(([name, value]) => {
        if (isBlank(next[name]) || next[name] === before[name]) {
            next[name] = value;
        }
    });
    return next;
}

/**
 * The agent's model choice by complexity, for the hint of the empty model
 *
 * @method modelChoice
 * @param {Agent} agent
 * @return {String} such as `simple: sonnet, complex: opus`; empty when the agent names none
 * @public
 */
export function modelChoice(agent) {
    let { simple, complex } = agent?.config ?? {};
    return [simple && `simple: ${simple}`, complex && `complex: ${complex}`].filter(Boolean).join(', ');
}
