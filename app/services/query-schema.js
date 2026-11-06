/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import Format from 'prometheus/utils/data/format';
import { issueStatusLabel, issueTypeRecordLabel } from 'prometheus/utils/issue-status/label';
import { createIssueSchema } from 'prometheus/utils/query/schemas/issue';
import { createProjectSchema } from 'prometheus/utils/query/schemas/project';

/**
 * Turns a `{value: label}` translation list into `{value, label}` options.
 *
 * @method options
 * @private
 */
function options(list) {
    return Object.entries(list || {}).map(([value, label]) => ({ value, label }));
}

/**
 * Loads the ezSearch schema of a module with its values: the statuses, milestones, issue types,
 * priorities and members of a project. Schemas are cached per module and project; the cache holds
 * the promise, so concurrent callers share one load, and a failed load is not kept.
 * Callers check `isDestroying`/`isDestroyed` after awaiting.
 *
 * @class QuerySchemaService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class QuerySchemaService extends Service {
    @service store;
    @service intl;

    /**
     * The loading and loaded schemas by `<module>:<projectId>`.
     *
     * @property cache
     * @type Map
     * @private
     */
    cache = new Map();

    /**
     * Load the schema of a module.
     *
     * @method load
     * @param {String} module `Issue` or `Project`
     * @param {Object} [options]
     * @param {String|Number} [options.projectId] The project whose values an Issue schema lists
     * @return {Promise<Object>} The schema
     * @public
     */
    load(module, { projectId = null } = {}) {
        let key = `${module}:${module === 'Issue' ? projectId : ''}`;

        if (!this.cache.has(key)) {
            let promise = this.build(module, projectId);

            this.cache.set(key, promise);
            promise.catch(() => {
                if (this.cache.get(key) === promise) {
                    this.cache.delete(key);
                }
            });
        }

        return this.cache.get(key);
    }

    /**
     * Forget the cached schemas, e.g. after the project's members or milestones changed.
     *
     * @method clear
     * @public
     */
    clear() {
        this.cache.clear();
    }

    /**
     * @method build
     * @private
     */
    async build(module, projectId) {
        if (module === 'Issue') {
            return createIssueSchema({ intl: this.intl, values: await this.issueValues(projectId) });
        }

        if (module === 'Project') {
            let format = new Format(this);

            return createProjectSchema({ intl: this.intl, values: { statuses: options(format.getTranslation('views.app.project.lists.status')) } });
        }

        throw new Error(`No query schema for the module ${module}`);
    }

    /**
     * The values of an Issue schema, loaded in parallel: the project with its members, issue types and
     * issue statuses, and its milestones.
     *
     * @method issueValues
     * @private
     */
    async issueValues(projectId) {
        let [projects, milestones] = await Promise.all([
            this.store.query('project', { query: `(Project.id : ${projectId})`, rels: 'members,issuetypes,issuestatuses', limit: -1 }),
            this.store.query('milestone', {
                query: `(projectId : ${projectId})`,
                fields: 'Milestone.name',
                sort: 'Milestone.dateCreated',
                order: 'DESC',
                limit: -1,
            }),
        ]);
        let project = projects.objectAt(0);
        let statuses = project?.get('issuestatuses')?.toArray() ?? [];

        if (statuses.length === 0) {
            statuses = (await this.store.query('issuestatus', { query: '(Issuestatus.system : 1)', limit: -1 })).toArray();
        }

        let format = new Format(this);

        return {
            statuses: statuses.map((status) => ({ value: status.name, label: issueStatusLabel(this.intl, status.name) })),
            milestones: milestones.toArray().map((milestone) => ({ value: milestone.name, label: milestone.name })),
            types: (project?.get('issuetypes')?.toArray() ?? []).map((type) => ({ value: type.name, label: issueTypeRecordLabel(this.intl, type) })),
            priorities: options(format.getTranslation('views.app.issue.lists.priority')),
            users: (project?.get('members')?.toArray() ?? []).map((user) => ({
                value: user.name,
                label: user.name,
                id: user.id,
                profilePicture: user.profilePicture,
            })),
        };
    }
}
