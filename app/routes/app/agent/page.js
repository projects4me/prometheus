/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

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
     * Loads the agent with its user and sponsor, then its user's roles, project memberships and identities.
     * These are separate queries because Gaia limits the joined rows of a hasMany, not the parents.
     *
     * @method model
     * @param {Object} params the route params
     * @return {Promise<Object>}
     */
    async model(params) {
        try {
            let agents = await this.store.query('agent', {
                query: `(Agent.id : ${params.agent_id})`,
                rels: 'user,sponsor'
            });
            let agent = agents.objectAt(0);
            let userId = agent.userId;
            let [userroles, memberships, identities, toolGrants, skillGrants, tools, servers, skills, activities] = await Promise.all([
                this.store.query('userrole', { query: `(Userrole.userId : ${userId})`, rels: 'role', limit: -1 }),
                this.store.query('membership', { query: `(Membership.userId : ${userId})`, rels: 'project', limit: -1 }),
                this.store.query('useridentity', { query: `(Useridentity.userId : ${userId})`, limit: -1 }),
                this.store.query('agenttool', { query: `(Agenttool.agentId : ${agent.id})`, limit: -1 }),
                this.store.query('agentskill', { query: `(Agentskill.agentId : ${agent.id})`, limit: -1 }),
                this.store.query('tool', { limit: -1 }),
                this.store.query('toolserver', { limit: -1 }),
                this.store.query('skill', { limit: -1 }),
                this.store.query('activity', {
                    query: `((Activity.createdUser : ${userId}) OR ((Activity.relatedTo : agent) AND (Activity.relatedId : ${agent.id})))`,
                    sort: 'Activity.dateCreated DESC',
                    limit: 50
                })
            ]);

            return {
                agent,
                userroles: userroles.toArray(),
                memberships: memberships.toArray(),
                identities: identities.toArray(),
                grantedTools: this.describeToolGrants(toolGrants, tools, servers),
                grantedSkills: this.describeSkillGrants(skillGrants, skills),
                activities: activities.toArray()
            };
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }
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
        return grants.toArray().map((grant) => {
            let tool = tools.toArray().find((item) => item.id === grant.toolId);
            let server = servers.toArray().find((item) => item.id === (grant.toolServerId ?? tool?.toolServerId));

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
        return grants.toArray().map((grant) => {
            let skill = skills.toArray().find((item) => item.id === grant.skillId);

            return { name: skill?.name, version: skill?.version };
        });
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Page} controller the controller of this route
     * @param {Object} model the agent and what belongs to it
     */
    setupController(controller, model) {
        let { agent, userroles, memberships, identities, grantedTools, grantedSkills, activities } = model;

        agent.user?.identities?.pushObjects(identities);
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
