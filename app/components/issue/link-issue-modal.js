/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import { task, timeout } from 'ember-concurrency';

/** The relations the modal offers, in display order (translation keys under linkModal.relations). */
const RELATIONS = ['blocks', 'blockedBy', 'relates', 'splitsInto', 'splitFrom', 'parentOf', 'childOf'];

/**
 * The Link issue modal of the Linked issues box: pick a relation and an issue of the workspace, then save through
 * the IssueRelations service. Gaia's 422 message is shown under the issue field and the modal stays open.
 *
 * @class IssueLinkIssueModalComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Issue::LinkIssueModal @issue={{this.issue}} @onLinked={{this.reload}} @onClose={{this.close}} />
 */
export default class IssueLinkIssueModalComponent extends Component {
	@service store;
	@service intl;
	@service issueRelations;

	@tracked relation = null;
	@tracked selectedIssue = null;
	@tracked errorMessage = null;

	/**
	 * @property relationOptions
	 * @type Array
	 */
	get relationOptions() {
		return RELATIONS.map((value) => ({ value, label: this.intl.t(`views.app.issue.detail.linkedIssues.linkModal.relations.${value}`) }));
	}

	/**
	 * Save needs a relation and an issue.
	 *
	 * @property cannotSave
	 * @type Boolean
	 */
	get cannotSave() {
		return !this.relation || !this.selectedIssue;
	}

	@action
	setRelation(option) {
		this.relation = option;
		this.errorMessage = null;
	}

	@action
	setIssue(option) {
		this.selectedIssue = option;
		this.errorMessage = null;
	}

	/**
	 * Ids of the projects of the workspace of the issue's project (at least the issue's own project).
	 *
	 * @method projectIds
	 * @return {String[]}
	 */
	projectIds() {
		let projectId = String(this.args.issue.projectId);
		let project = this.store.peekRecord('project', projectId);
		let ids = project?.workspaceId
			? this.store.peekAll('project').filter((other) => other.workspaceId === project.workspaceId).map((other) => String(other.id))
			: [];
		return ids.includes(projectId) ? ids : [projectId, ...ids];
	}

	/**
	 * Searches issues of the workspace's projects by number or subject, without the current issue.
	 *
	 * @property issueSearch
	 * @type Task
	 */
	issueSearch = task(async (query) => {
		await timeout(300);
		let projects = this.projectIds().map((id) => `(Issue.projectId : ${id})`).join(' OR ');
		let text = String(query || '').trim();
		let search = text ? ` AND ((Issue.issueNumber CONTAINS ${text}) OR (Issue.subject CONTAINS ${text}))` : '';
		let issues = await this.store.query('issue', {
			query: `((${projects}) AND (Issue.id !: ${this.args.issue.id})${search})`,
			limit: 10,
			sort: 'Issue.issueNumber',
			order: 'DESC'
		});
		return issues.slice().map((issue) => ({
			id: issue.id,
			name: issue.subject,
			number: issue.issueNumber,
			code: `${String(issue.projectShortcode || '').toLowerCase()}-${issue.issueNumber}`
		}));
	});

	/**
	 * Saves the link. Resolves false (modal stays open) when Gaia refuses it.
	 *
	 * @method save
	 * @return {Promise<Boolean>}
	 */
	@action
	async save() {
		if (this.cannotSave) {
			return false;
		}
		this.errorMessage = null;
		try {
			let other = this.store.peekRecord('issue', this.selectedIssue.id) || (await this.store.findRecord('issue', this.selectedIssue.id));
			await this.issueRelations.link(this.args.issue, this.relation.value, other);
		} catch (error) {
			if (!isDestroying(this) && !isDestroyed(this)) {
				this.errorMessage = error?.errors?.[0]?.detail || error?.errors?.[0]?.title || this.intl.t('views.app.issue.detail.linkedIssues.linkModal.failed');
			}
			return false;
		}
		this.args.onLinked?.();
		return true;
	}
}
