/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * An AI agent. Every agent is a user of type agent (`user`) extended with the runtime
 * configuration stored here, and may act on behalf of a sponsor.
 *
 * @class Agent
 * @namespace Prometheus.Model
 * @extends DS.Model
 */
export default class AgentModel extends Model {
    /**
     * The agent's name, copied to its user.
     *
     * @property name
     * @type String
     */
    @attr('string') name;

    /**
     * The agent's login email. Only sent when the agent is created; Gaia copies it to the user.
     *
     * @property email
     * @type String
     */
    @attr('string') email;

    /**
     * Account status of the agent's user (`active` or `inactive`). Only sent when the agent is created.
     *
     * @property accountStatus
     * @type String
     */
    @attr('string', { defaultValue: 'active' }) accountStatus;

    /**
     * One line description of what the agent does.
     *
     * @property purpose
     * @type String
     */
    @attr('string') purpose;

    /**
     * The id of the user the agent acts on behalf of, empty for an autonomous agent.
     *
     * @property sponsorId
     * @type String
     */
    @attr('string') sponsorId;

    /**
     * The agent's role prompt, in markdown.
     *
     * @property rolePrompt
     * @type String
     */
    @attr('string') rolePrompt;

    /**
     * Model by complexity, as JSON text or object: `{"simple", "complex", "escalation"}`.
     *
     * @property modelConfig
     * @type Object|String
     */
    @attr() modelConfig;

    /**
     * Maximum turns of one run.
     *
     * @property maxTurns
     * @type Number
     */
    @attr('number') maxTurns;

    /**
     * Maximum runs per issue.
     *
     * @property maxRunsPerIssue
     * @type Number
     */
    @attr('number') maxRunsPerIssue;

    /**
     * How the agent's tool calls are approved.
     *
     * @property permissionMode
     * @type String
     */
    @attr('string') permissionMode;

    /**
     * @property userId
     * @type String
     */
    @attr('string') userId;

    /**
     * @property dateCreated
     * @type String
     */
    @attr('string') dateCreated;

    /**
     * @property dateModified
     * @type String
     */
    @attr('string') dateModified;

    /**
     * The users row of this agent.
     *
     * @property user
     * @type Prometheus.Models.User
     */
    @belongsTo('user', { async: false, inverse: null }) user;

    /**
     * The user this agent acts on behalf of.
     *
     * @property sponsor
     * @type Prometheus.Models.User
     */
    @belongsTo('user', { async: false, inverse: null }) sponsor;

    /**
     * The model config as an object, whether Gaia returned it as JSON text or as an object.
     *
     * @property config
     * @type Object
     */
    get config() {
        let raw = this.modelConfig;
        if (typeof raw === 'string') {
            try {
                raw = JSON.parse(raw);
            } catch (e) {
                raw = null;
            }
        }
        return raw && typeof raw === 'object' ? raw : {};
    }

    /**
     * The simple and complex models for lists, such as `sonnet · opus`; just one name when only one is set.
     *
     * @property models
     * @type String
     */
    get models() {
        let { simple, complex } = this.config;
        return [simple, complex].filter(Boolean).join(' · ');
    }

    /**
     * Whether the agent's user is active.
     *
     * @property isActive
     * @type Boolean
     */
    get isActive() {
        return (this.user?.accountStatus ?? this.accountStatus) === 'active';
    }
}
