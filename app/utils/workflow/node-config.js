/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The settings each node kind takes, so the properties panel can draw a form per kind. It mirrors the config fields
 * of Gaia's NodeKindCatalog and the operators of NodeConfigRules; Gaia still validates every config on save.
 *
 * A field has a name, a type and whether it is required. The types are:
 * - `text` and `longText`: a string that may hold expressions such as `{issue.subject}`;
 * - `cron`: a cron expression;
 * - `field`: a payload path of the trigger, such as `issue.priority`;
 * - `user`, `agent` and `issuetype`: the id of a record, or an expression that names one;
 * - `conditions`: a list of { field, operator, value };
 * - `cases`: a list of { key, conditions }, one output port per case.
 *
 * @class NodeConfig
 * @namespace Prometheus.Utils.Workflow
 */

/**
 * The operators a filter or switch condition may use
 *
 * @property OPERATORS
 * @type Array
 * @public
 */
export const OPERATORS = ['equals', 'notEquals', 'contains', 'in', 'notIn', 'empty', 'notEmpty', 'gt', 'lt'];

/**
 * The operators that take no value
 *
 * @property VALUELESS_OPERATORS
 * @type Array
 * @public
 */
export const VALUELESS_OPERATORS = ['empty', 'notEmpty'];

/**
 * The port a switch takes when no case matches; a case can't use it as its key
 *
 * @property DEFAULT_PORT
 * @type String
 * @public
 */
export const DEFAULT_PORT = 'default';

const field = (name, type, required = false) => ({ name, type, required });

/**
 * The config fields of each kind, by category. Trigger events take none; the schedule takes its cron.
 *
 * @property FIELDS
 * @type Object
 * @private
 */
const FIELDS = {
    trigger: {
        schedule: [field('cron', 'cron', true)]
    },
    condition: {
        filter: [field('conditions', 'conditions', true)],
        switch: [field('cases', 'cases', true)]
    },
    actor: {
        run_agent: [
            field('agentId', 'agent', true),
            field('prompt', 'longText'),
            field('session', 'text'),
            field('model', 'text'),
            field('maxTurns', 'text'),
            field('claimTimeout', 'text'),
            field('timeout', 'text')
        ],
        ask_user: [field('userId', 'user', true), field('question', 'longText', true)]
    },
    action: {
        assign: [field('assigneeId', 'user', true)],
        set_field: [field('field', 'field', true), field('value', 'text', true)],
        set_status: [field('status', 'text', true)],
        add_comment: [field('body', 'longText', true), field('ownerId', 'user')],
        create_issue: [
            field('subject', 'text', true),
            field('description', 'longText'),
            field('typeId', 'issuetype'),
            field('priority', 'text'),
            field('ownerId', 'user'),
            field('assigneeId', 'user')
        ],
        create_wiki: [field('title', 'text', true), field('body', 'longText'), field('ownerId', 'user')],
        notify: [field('userId', 'user', true), field('message', 'longText', true)],
        call_tool: [field('toolId', 'text', true)]
    }
};

/**
 * The config fields of a kind, empty for a kind that takes none
 *
 * @method configFields
 * @param {String} category
 * @param {String} kind
 * @return {Array}
 * @public
 */
export function configFields(category, kind) {
    return FIELDS[category]?.[kind] ?? [];
}

/**
 * Whether a value is one expression over the run's values, such as `{issue.assignee}`
 *
 * @method isExpression
 * @param {*} value
 * @return {Boolean}
 * @public
 */
export function isExpression(value) {
    return typeof value === 'string' && /^\{[^{}]+\}$/.test(value.trim());
}

/**
 * The expression that names a payload path
 *
 * @method expressionOf
 * @param {String} path
 * @return {String}
 * @public
 */
export function expressionOf(path) {
    return `{${path}}`;
}

/**
 * Payload path segments that hold the id of a user, such as issue.assignee or actor.id
 *
 * @property ACTOR_SEGMENT
 * @type RegExp
 * @private
 */
const ACTOR_SEGMENT = /^(id|assignee|owner|.+Id|.+User)$/;

/**
 * The payload paths that may hold the id of a user or an agent
 *
 * @method actorPaths
 * @param {Array} payloadFields the trigger's payload paths, as [{ path, type }]
 * @return {Array} the matching paths
 * @public
 */
export function actorPaths(payloadFields = []) {
    return payloadFields
        .map(({ path }) => String(path))
        .filter(path => path.split('.').some(segment => ACTOR_SEGMENT.test(segment)));
}

/**
 * Whether a config value counts as set: Gaia treats null and '' as missing
 *
 * @method isSet
 * @param {*} value
 * @return {Boolean}
 * @private
 */
function isSet(value) {
    return value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
}

/**
 * A condition as Gaia takes it: the value is left out for operators that take none
 *
 * @method cleanCondition
 * @param {Object} condition
 * @return {Object}
 * @private
 */
function cleanCondition(condition = {}) {
    let clean = { field: condition.field ?? '', operator: condition.operator ?? '' };
    if (!VALUELESS_OPERATORS.includes(clean.operator) && isSet(condition.value)) {
        clean.value = condition.value;
    }
    return clean;
}

/**
 * The config a form's draft saves as: only the kind's fields, without the unset ones, and with the conditions
 * of filters and switch cases cleaned. Gaia refuses settings a kind doesn't take, so other keys are dropped.
 *
 * @method buildConfig
 * @param {String} category
 * @param {String} kind
 * @param {Object} draft
 * @return {Object}
 * @public
 */
export function buildConfig(category, kind, draft = {}) {
    let config = {};
    configFields(category, kind).forEach(({ name, type }) => {
        let value = draft?.[name];
        if (type === 'conditions') {
            value = Array.isArray(value) ? value.map(cleanCondition) : value;
        } else if (type === 'cases') {
            value = Array.isArray(value)
                ? value.map(entry => ({
                    key: (entry?.key ?? '').trim(),
                    conditions: (entry?.conditions ?? []).map(cleanCondition)
                }))
                : value;
        } else if (typeof value === 'string') {
            value = value.trim();
        }
        if (Array.isArray(value) ? value.length > 0 : isSet(value)) {
            config[name] = value;
        }
    });
    return config;
}

/**
 * The payload paths the triggers of a graph offer, with their types, in catalog order and without repeats.
 * The pickers of every other step offer these.
 *
 * @method triggerFields
 * @param {Array} nodes the graph's nodes
 * @param {Array} events the trigger catalog, as Workflowevent records or plain objects
 * @return {Array} [{ path, type }]
 * @public
 */
export function triggerFields(nodes = [], events = []) {
    let kinds = nodes.filter(node => node.category === 'trigger').map(node => node.kind);
    let seen = new Set();
    let fields = [];
    events.filter(event => kinds.includes(event.name ?? event.id)).forEach(event => {
        (event.fields ?? []).forEach(entry => {
            if (entry?.path && !seen.has(entry.path)) {
                seen.add(entry.path);
                fields.push({ path: entry.path, type: entry.type });
            }
        });
    });
    return fields;
}
