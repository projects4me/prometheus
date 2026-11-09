/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Format from 'prometheus/utils/data/format';
import { issueStatusLabel, issueTypeRecordLabel } from 'prometheus/utils/issue-status/label';

/**
 * The value sources of ezSearch fields, by name. A field in `views.<Module>.search` of the metadata
 * names one in `values: { source, ...params }`; the query-schema service calls it to list the values
 * the field can take. A source is `async (params, context) => [{value, label, ...}]`, where `params`
 * is the field's `values` entry and `context` comes from `createContext`.
 *
 * Adding a value source is the only part of search that needs code: add an entry here and name it in
 * the metadata.
 *
 * @class ValueSources
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * A user record as a `user` field value. The value is the user's name, or the user's id when the
 * field's `values` say `value: 'id'` (for fields that store a user id, e.g. `votes.createdUser`); the
 * label is always the name.
 *
 * @method userOption
 * @private
 */
function userOption(user, { value } = {}) {
    return { value: value === 'id' ? user.id : user.name, label: user.name, id: user.id, profilePicture: user.profilePicture };
}

/**
 * User options with the current user moved to the front and marked `pinned`, when the field's
 * `values` say `currentUserFirst: true`. Lists that sort their values keep pinned ones first.
 *
 * @method userOptions
 * @private
 */
function userOptions(users, params, context) {
    let options = users.map((user) => userOption(user, params));

    if (!params.currentUserFirst || context.currentUserId === null || context.currentUserId === undefined) {
        return options;
    }

    let currentId = String(context.currentUserId);
    let current = options.filter((option) => String(option.id) === currentId).map((option) => ({ ...option, pinned: true }));

    return [...current, ...options.filter((option) => String(option.id) !== currentId)];
}

/**
 * The project of the context with its members, issue types and issue statuses, loaded once per
 * context so the sources that read it share one request.
 *
 * @method project
 * @private
 */
function project(context) {
    if (context.projectId === null || context.projectId === undefined) {
        return Promise.resolve(null);
    }

    return context.once('project', async () => {
        let projects = await context.store.query('project', {
            query: `(Project.id : ${context.projectId})`,
            rels: 'members,issuetypes,issuestatuses',
            limit: -1,
        });

        return projects.objectAt(0) ?? null;
    });
}

/**
 * A has-many relationship of the context's project as an array.
 *
 * @method projectRecords
 * @private
 */
async function projectRecords(context, relationship) {
    return (await project(context))?.get(relationship)?.toArray() ?? [];
}

/**
 * The registered value sources.
 *
 * @property VALUE_SOURCES
 * @type Object
 * @final
 */
export const VALUE_SOURCES = Object.freeze({
    /**
     * A static translation list, `{ source: 'translation', key: 'views.app.issue.lists.priority' }`.
     */
    async translation({ key }, context) {
        let list = new Format(context.owner).getTranslation(key);

        return Object.entries(list || {}).map(([value, label]) => ({ value, label }));
    },

    /**
     * The issue statuses of the project, or the system statuses when it has none.
     */
    async issueStatuses(params, context) {
        let statuses = await projectRecords(context, 'issuestatuses');

        if (statuses.length === 0) {
            statuses = (await context.store.query('issuestatus', { query: '(Issuestatus.system : 1)', limit: -1 })).toArray();
        }

        return statuses.map((status) => ({ value: status.name, label: issueStatusLabel(context.intl, status.name) }));
    },

    /**
     * The milestones of the project, newest first.
     */
    async milestones(params, context) {
        if (context.projectId === null || context.projectId === undefined) {
            return [];
        }

        let milestones = await context.store.query('milestone', {
            query: `(projectId : ${context.projectId})`,
            fields: 'Milestone.name',
            sort: 'Milestone.dateCreated',
            order: 'DESC',
            limit: -1,
        });

        return milestones.toArray().map((milestone) => ({ value: milestone.name, label: milestone.name }));
    },

    /**
     * The issue types of the project.
     */
    async issueTypes(params, context) {
        return (await projectRecords(context, 'issuetypes')).map((type) => ({ value: type.name, label: issueTypeRecordLabel(context.intl, type) }));
    },

    /**
     * The members of the project, with their avatars. Takes the user options `value: 'id'` and
     * `currentUserFirst: true`.
     */
    async members(params, context) {
        return userOptions(await projectRecords(context, 'members'), params, context);
    },

    /**
     * All users, with their avatars. Takes the user options `value: 'id'` and `currentUserFirst: true`.
     */
    async users(params, context) {
        let users = await context.store.query('user', { fields: 'User.id,User.name,User.profilePicture', sort: 'User.name', order: 'ASC', limit: -1 });

        return userOptions(users.toArray(), params, context);
    },
});

/**
 * The value source registered under a name.
 *
 * @method valueSource
 * @param {String} name
 * @return {Function|null} The source, or null when none is registered under the name
 */
export function valueSource(name) {
    return Object.prototype.hasOwnProperty.call(VALUE_SOURCES, name) ? VALUE_SOURCES[name] : null;
}

/**
 * The context the sources of one schema load with: the services, the context the schema was asked
 * for (e.g. the project) and a `once(key, fn)` that runs a load once and shares its promise.
 *
 * @method createContext
 * @param {Object} options
 * @param {Object} options.owner An object with an owner, for `Format`
 * @param {Ember.Service} options.store
 * @param {Ember.Service} options.intl
 * @param {String|Number} [options.projectId]
 * @param {String|Number} [options.currentUserId] The signed-in user, for `currentUserFirst`
 * @return {Object} The context
 */
export function createContext({ owner, store, intl, projectId = null, currentUserId = null }) {
    let loads = new Map();

    return {
        owner,
        store,
        intl,
        projectId,
        currentUserId,
        once(key, fn) {
            if (!loads.has(key)) {
                loads.set(key, fn());
            }

            return loads.get(key);
        },
    };
}
