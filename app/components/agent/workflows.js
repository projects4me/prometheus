/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { postToast } from 'prometheus/utils/ui/post-toast';
import { rowsOf } from 'prometheus/utils/workflow/agent-references';

/**
 * The Workflows box of an agent's detail page: the workflows that reference the agent, as the trigger, where
 * the agent is referenced, the scope and the status of each, with a link to the workflows list.
 *
 * @class AgentWorkflowsComponent
 * @namespace Prometheus.Components.Agent
 * @extends Glimmer.Component
 */
export default class AgentWorkflowsComponent extends Component {
	/**
	 * @property store
	 * @type Ember.Service
	 */
	@service store;

	/**
	 * @property intl
	 * @type Ember.Service
	 */
	@service intl;

	/**
	 * The rows of the box.
	 *
	 * @property rows
	 * @type Array
	 */
	@tracked rows = [];

	/**
	 * Whether the references were loaded.
	 *
	 * @property loaded
	 * @type Boolean
	 */
	@tracked loaded = false;

	/**
	 * Loads the references of the agent, then their workflows, the nodes of those and the projects named by
	 * their scope.
	 *
	 * @method load
	 */
	@action async load() {
		try {
			let references = (await this.store.query('workflowreference', {
				query: `(Workflowreference.entityType : Agent) (Workflowreference.entityId : ${this.args.agent.id})`,
				limit: -1
			})).slice();
			let workflowIds = [...new Set(references.map((reference) => String(reference.workflowId)))];
			let workflows = [];
			let nodes = [];
			let projects = [];

			if (workflowIds.length) {
				let any = (field) => workflowIds.map((id) => `(${field} : ${id})`).join(' OR ');
				let [workflowRecords, nodeRecords, projectRecords] = await Promise.all([
					this.store.query('workflow', { query: any('Workflow.id'), limit: -1 }),
					this.store.query('workflownode', { query: any('Workflownode.workflowId'), limit: -1 }),
					this.store.query('project', { limit: -1 })
				]);
				workflows = workflowRecords.slice();
				nodes = nodeRecords.slice();
				projects = projectRecords.slice();
			}
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.rows = rowsOf(workflows, references, nodes, projects);
			this.loaded = true;
		} catch (error) {
			if (!this.isDestroying && !this.isDestroyed) {
				postToast(this.intl, 'views.app.agent.workflows.loadFailed', 'error');
			}
		}
	}
}
