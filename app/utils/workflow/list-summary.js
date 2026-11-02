/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { parseConfig } from './graph';

const DAY = 24 * 60 * 60 * 1000;

/**
 * What the workflows list shows about a workflow, read from its trigger and actor nodes and its runs.
 * Pure functions, so the list controller stays thin.
 *
 * @module Workflow.ListSummary
 */

/**
 * Turns an identifier such as `assignee.changed` into a sentence start: `Assignee changed`.
 *
 * @method humanize
 * @param {String} text
 * @return {String}
 * @private
 */
function humanize(text) {
    let spaced = text.replace(/[._]/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The trigger of a workflow as entity and event, from the kind of its trigger node (`issue.assignee.changed` is
 * the entity `Issue` and the event `Assignee changed`); a schedule shows its cron expression as the event.
 *
 * @method triggerOf
 * @param {Array} nodes the workflownode records of the workflow
 * @return {Object|null} `{ entity, event }`, or null without a trigger
 * @public
 */
export function triggerOf(nodes) {
    let node = nodes.find(candidate => candidate.category === 'trigger');
    if (!node || !node.kind) {
        return null;
    }
    let [entity, ...event] = node.kind.split('.');
    if (!event.length) {
        return { entity: humanize(entity), event: parseConfig(node.config).cron ?? null };
    }
    return { entity: humanize(entity), event: humanize(event.join('.')) };
}

/**
 * Reads a placeholder such as `{agent:issue.assignee}` or `{issue.assigneeId}`: the role is the last part of its
 * path (`assignee`) and a `sponsor:` prefix marks the sponsor of that role.
 *
 * @method placeholderOf
 * @param {String} value the placeholder with its braces
 * @return {Object} `{ role, sponsor }`
 * @private
 */
function placeholderOf(value) {
    let [, prefix, path] = value.slice(1, -1).match(/^(?:(\w+):)?(.+)$/);
    let role = path.split('.').pop().replace(/Id$/, '');
    return { role: role.charAt(0).toUpperCase() + role.slice(1), sponsor: prefix === 'sponsor' };
}

/**
 * The actors of a workflow, in node order and without repeats: `run_agent` nodes name an agent by id and
 * `ask_user` nodes a user. A value such as `{agent:issue.assignee}` is resolved when the workflow runs, so it
 * is kept as a placeholder.
 *
 * @method actorsOf
 * @param {Array} nodes the workflownode records of the workflow
 * @return {Array} `{ type: 'agent'|'user', id, role, sponsor }` entries; a placeholder has no id
 * @public
 */
export function actorsOf(nodes) {
    let seen = new Set();
    let actors = [];

    nodes.filter(node => node.category === 'actor').forEach((node) => {
        let config = parseConfig(node.config);
        let type = node.kind === 'run_agent' ? 'agent' : 'user';
        let value = String(node.kind === 'run_agent' ? config.agentId ?? '' : config.userId ?? '');
        if (!value || seen.has(`${type}:${value}`)) {
            return;
        }
        seen.add(`${type}:${value}`);
        actors.push(/^\{.*\}$/.test(value) ? { type, id: null, ...placeholderOf(value) } : { type, id: value, role: null, sponsor: false });
    });

    return actors;
}

/**
 * The project ids a workflow is scoped to; empty means every project.
 *
 * @method scopeOf
 * @param {String} scope the JSON text of the scope
 * @return {Array}
 * @public
 */
export function scopeOf(scope) {
    try {
        let ids = JSON.parse(scope || '[]');
        return Array.isArray(ids) ? ids.map(String) : [];
    } catch (e) {
        return [];
    }
}

/**
 * The runs of the last 7 days and the latest run of a workflow.
 *
 * @method runStatsOf
 * @param {Array} runs the workflowrun records of the workflow
 * @param {Number} [now] the current time in milliseconds
 * @return {Object} `{ count, last }` where last is a date string or null
 * @public
 */
export function runStatsOf(runs, now = Date.now()) {
    let dates = runs
        .map(run => run.startedAt || run.dateCreated)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a));
    return {
        count: dates.filter(date => now - new Date(date).getTime() <= 7 * DAY).length,
        last: dates[0] ?? null
    };
}
