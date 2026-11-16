/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import { service } from '@ember/service';

import { objectAt } from 'prometheus/utils/array/object-at';
import { pushRecords } from 'prometheus/utils/array/record-list';
/**
 * The route of an agent's detail page.
 *
 * @class AppAgentPageRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppRoute
 */
export default class AppAgentPageRoute extends AppRoute {
    /**
     * Batches the agent's related queries into one bulk request.
     *
     * @property bulk
     * @type Ember.Service
     */
    @service bulk;

    /**
     * Loads the agent with its user and sponsor, then its user's roles, project memberships, identities, grants and activities in one bulk request.
     * These are separate queries because Gaia limits the joined rows of a hasMany, not the parents.
     * Resolves to `{ notFound: true }` when there is no such agent and to `{ failed: true }` when a query fails.
     *
     * @method model
     * @param {Object} params the route params
     * @return {Promise<Object>}
     */
    async model(params) {
        let agent;
        try {
            let agents = await this.store.query('agent', {
                query: `(Agent.id : ${params.agent_id})`,
                rels: 'user,sponsor'
            });
            agent = objectAt(agents, 0);
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'agent' });
            return { failed: true };
        }
        if (!agent) {
            return { notFound: true };
        }

        let userId = agent.userId;
        let results;
        try {
            results = await this.bulk.query([
                { id: 'userroles', modelName: 'userrole', query: { query: `(Userrole.userId : ${userId})`, rels: 'role', limit: -1 } },
                { id: 'memberships', modelName: 'membership', query: { query: `(Membership.userId : ${userId})`, rels: 'project', limit: -1 } },
                { id: 'identities', modelName: 'useridentity', query: { query: `(Useridentity.userId : ${userId})`, limit: -1 } },
                { id: 'toolGrants', modelName: 'agenttool', query: { query: `(Agenttool.agentId : ${agent.id})`, limit: -1 } },
                { id: 'skillGrants', modelName: 'agentskill', query: { query: `(Agentskill.agentId : ${agent.id})`, limit: -1 } },
                { id: 'tools', modelName: 'tool', query: { limit: -1 } },
                { id: 'servers', modelName: 'toolserver', query: { limit: -1 } },
                { id: 'skills', modelName: 'skill', query: { limit: -1 } },
                {
                    id: 'activities',
                    modelName: 'activity',
                    query: {
                        query: `((Activity.createdUser : ${userId}) OR ((Activity.relatedTo : agent) AND (Activity.relatedId : ${agent.id})))`,
                        sort: 'Activity.dateCreated',
                        order: 'DESC',
                        limit: 50
                    }
                }
            ]);
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'agent' });
            return { failed: true };
        }

        // a failing item fails the page, as a failing query did before
        let failed = Object.values(results).find((result) => result.error);
        if (failed) {
            this.errorManager.handleLoadError(failed.error, { moduleName: 'agent' });
            return { failed: true };
        }

        let records = (id) => results[id].records;

        return {
            agent,
            userroles: records('userroles').slice(),
            memberships: records('memberships').slice(),
            identities: records('identities').slice(),
            grantedTools: this.describeToolGrants(records('toolGrants'), records('tools'), records('servers')),
            grantedSkills: this.describeSkillGrants(records('skillGrants'), records('skills')),
            activities: records('activities').slice()
        };
    }

    /**
     * The tools and tool servers granted to the agent, with the name of what is granted.
     *
     * @method describeToolGrants
     * @param {Array} grants the agent's grants
     * @param {Array} tools the tools of the catalog
     * @param {Array} servers the tool servers of the catalog
     * @return {Array} `{ name, server, isServer, permissionRule }` per grant
     */
    describeToolGrants(grants, tools, servers) {
        return grants.slice().map((grant) => {
            let tool = tools.slice().find((item) => item.id === grant.toolId);
            let server = servers.slice().find((item) => item.id === (grant.toolServerId ?? tool?.toolServerId));

            return {
                name: tool ? tool.name : server?.name,
                server: tool ? server?.name : null,
                isServer: !tool,
                permissionRule: grant.permissionRule
            };
        });
    }

    /**
     * @method describeSkillGrants
     * @param {Array} grants the agent's skill grants
     * @param {Array} skills the skills of the catalog
     * @return {Array} `{ name, version }` per grant
     */
    describeSkillGrants(grants, skills) {
        return grants.slice().map((grant) => {
            let skill = skills.slice().find((item) => item.id === grant.skillId);

            return { name: skill?.name, version: skill?.version };
        });
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Page} controller the controller of this route
     * @param {Object} model the agent and what belongs to it
     */
    setupController(controller, model) {
        let { agent, userroles, memberships, identities, grantedTools, grantedSkills, activities, notFound, failed } = model;

        controller.set('notFound', Boolean(notFound));
        controller.set('loadFailed', Boolean(failed));
        if (!agent) {
            controller.set('model', null);
            return;
        }
        pushRecords(agent.user?.identities, identities);
        controller.set('model', agent);
        controller.set('userroles', userroles);
        controller.set('memberships', memberships);
        controller.set('activities', activities);
        controller.set('grantedTools', grantedTools);
        controller.set('grantedSkills', grantedSkills);
        controller.set('showWholePrompt', false);
        this.breadcrumb.setTitle(this.routeName, agent.name);
    }
}
