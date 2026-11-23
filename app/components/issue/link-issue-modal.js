/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import { relsForQuery } from 'prometheus/utils/query/rels';
import Selection from 'prometheus/utils/state/selection';

/** The relations the modal offers, in display order (translation keys under linkModal.relations). */
const RELATIONS = ['blocks', 'blockedBy', 'relates', 'splitsInto', 'splitFrom', 'parentOf', 'childOf'];

/** The relation the first row starts with. */
const DEFAULT_RELATION = 'relates';

const PAGE_SIZE = 10;

/** Relations always requested: the assignee is shown, the project scopes the workspace filter. */
const ALWAYS_RELS = ['assignedTo', 'project'];

/**
 * The Link issues modal of the Linked issues box: search the issues of the workspace with EzSearchCompact, tick the
 * ones to link (the selection is kept across searches), give each a relation in the "To link" table and save them
 * through IssueRelations.linkMany. Rows Gaia refuses stay with its message; the modal closes when none is left.
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
	@service querySchema;

	/** The ticked results, kept across searches. */
	selection = new Selection();

	@tracked schema = null;
	@tracked results = [];
	@tracked total = null;
	@tracked hasMore = false;
	@tracked isSearching = true;
	@tracked searchFailed = false;
	/** The rows of the To link table: `{ issue, relation, error }`. */
	@tracked rows = [];
	@tracked linkedIds = [];
	@tracked isReady = false;

	/** Relation chosen last; a new row starts with it. */
	lastRelation = null;
	searchId = 0;

	/**
	 * @property relationOptions
	 * @type Array
	 */
	relationOptions = RELATIONS.map((value) => ({ value, label: this.intl.t(`views.app.issue.detail.linkedIssues.linkModal.relations.${value}`) }));

	/**
	 * @property columns
	 * @type Array
	 */
	get columns() {
		let t = (key) => this.intl.t(`views.app.issue.detail.linkedIssues.columns.${key}`);
		return [
			{ key: 'issue', label: t('issue') },
			{ key: 'status', label: t('status') },
			{ key: 'assignee', label: t('assignee') }
		];
	}

	/**
	 * Save needs at least one row.
	 *
	 * @property cannotSave
	 * @type Boolean
	 */
	get cannotSave() {
		return this.rows.length === 0;
	}

	/**
	 * The muted "N issues" line, or "Showing 10. Refine the search to see others." when more match.
	 *
	 * @property countLine
	 * @type String
	 */
	get countLine() {
		return this.total === null ? '' : this.intl.t(this.hasMore ? 'views.app.issue.detail.linkedIssues.linkModal.refine' : 'views.app.issue.detail.linkedIssues.linkModal.count', { shown: this.results.length });
	}

	/**
	 * Limits the search to the workspace of the issue's project (or the project itself when it has none), without this
	 * issue and the issues already linked to it.
	 *
	 * @property baseQuery
	 * @type String
	 */
	get baseQuery() {
		let issue = this.args.issue;
		let project = this.store.peekRecord('project', String(issue.projectId));
		let scope = project?.workspaceId ? `(project.workspaceId : ${project.workspaceId})` : `(Issue.projectId : ${issue.projectId})`;
		let ids = [String(issue.id), ...this.linkedIds];
		let excluded = ids.length > 1 ? `(Issue.id !CONTAINS ${ids.map((id) => `'${id}'`).join(',')})` : `(Issue.id !: ${ids[0]})`;
		return `(${scope} AND ${excluded})`;
	}

	/**
	 * `#number` for an issue of the current project, `code-number` for one of another project.
	 *
	 * @method label
	 * @param {Issue} issue
	 * @return {String}
	 */
	label = (issue) =>
		String(issue.projectId) === String(this.args.issue.projectId) ? `#${issue.issueNumber}` : `${String(issue.projectShortcode || '').toLowerCase()}-${issue.issueNumber}`;

	/**
	 * Loads the schema and the issues already linked, then shows the most recently modified issues.
	 *
	 * @method setup
	 */
	@action
	async setup() {
		let issue = this.args.issue;
		try {
			let [schema, groups] = await Promise.all([
				this.querySchema.load('Issue', { projectId: issue.projectId }),
				this.issueRelations.load(issue).catch(() => ({}))
			]);
			if (this.gone) {
				return;
			}
			this.schema = Array.isArray(schema) ? null : schema;
			this.linkedIds = [...new Set(Object.values(groups).flat().map((row) => String(row.issue.id)))];
		} catch {
			if (this.gone) {
				return;
			}
		}
		this.isReady = true;
		await this.search(this.baseQuery);
	}

	get gone() {
		return isDestroying(this) || isDestroyed(this);
	}

	/**
	 * Runs a search (the query already holds the base query) and counts the matches.
	 *
	 * @method search
	 * @param {String} query
	 */
	@action
	async search(query) {
		let id = ++this.searchId;
		this.isSearching = true;
		this.searchFailed = false;
		try {
			let rels = relsForQuery(this.schema, query, ALWAYS_RELS);
			// One row more than the page tells whether others match; Gaia's meta.count is the page count, not a total
			let issues = await this.store.query('issue', { query, rels, limit: PAGE_SIZE + 1, sort: 'Issue.dateModified', order: 'DESC' });
			if (this.gone || id !== this.searchId) {
				return;
			}
			let rows = issues.slice();
			this.hasMore = rows.length > PAGE_SIZE;
			this.results = rows.slice(0, PAGE_SIZE);
			this.total = this.results.length;
		} catch {
			if (this.gone || id !== this.searchId) {
				return;
			}
			this.results = [];
			this.total = null;
			this.searchFailed = true;
		}
		this.isSearching = false;
	}

	/**
	 * The selection changed in the results: add a row for each newly ticked issue and drop the rows of unticked ones.
	 *
	 * @method onSelectionChange
	 */
	@action
	onSelectionChange() {
		let ids = this.selection.ids;
		let kept = this.rows.filter((row) => ids.includes(String(row.issue.id)));
		let added = ids
			.filter((id) => !kept.some((row) => String(row.issue.id) === id))
			.map((id) => this.results.find((issue) => String(issue.id) === id))
			.filter(Boolean)
			.map((issue) => ({ issue, relation: this.nextRelation(), error: null }));
		this.rows = [...kept, ...added];
	}

	/**
	 * The relation of a new row: the first is "relates to", the next ones the one picked last. "is child of" falls
	 * back to the default when it is not available.
	 *
	 * @method nextRelation
	 * @return {Object}
	 */
	nextRelation() {
		let value = this.lastRelation || DEFAULT_RELATION;
		let option = this.relationOptions.find((item) => item.value === value);
		let taken = value === 'childOf' && (this.args.issue.parentId || this.rows.some((row) => row.relation.value === 'childOf'));
		return taken ? this.relationOptions.find((item) => item.value === DEFAULT_RELATION) : option;
	}

	/**
	 * The relations a row can pick: "is child of" only when the issue has no parent and no other row has it.
	 *
	 * @method optionsFor
	 * @param {Object} row
	 * @return {Array}
	 */
	optionsFor = (row) =>
		this.relationOptions.filter(
			(option) => option.value !== 'childOf' || (!this.args.issue.parentId && this.rows.every((other) => other === row || other.relation.value !== 'childOf'))
		);

	@action
	setRelation(row, option) {
		if (!option) {
			return;
		}
		this.lastRelation = option.value;
		this.rows = this.rows.map((item) => (item === row ? { ...item, relation: option, error: null } : item));
	}

	@action
	removeRow(row) {
		this.rows = this.rows.filter((item) => item !== row);
		this.selection.set([row.issue.id], false);
	}

	/**
	 * Links the rows one after the other. Linked rows leave the table, refused ones stay with Gaia's message.
	 * Resolves true (the modal closes) when no row is left.
	 *
	 * @method save
	 * @return {Promise<Boolean>}
	 */
	@action
	async save() {
		if (this.cannotSave) {
			return false;
		}
		let rows = this.rows;
		let results = await this.issueRelations.linkMany(
			this.args.issue,
			rows.map((row) => ({ target: row.issue, relation: row.relation.value }))
		);
		if (this.gone) {
			return false;
		}
		let linked = [];
		let failed = [];
		rows.forEach((row, index) => {
			let error = results[index].error;
			if (error) {
				failed.push({
					...row,
					error: error?.errors?.[0]?.detail || error?.errors?.[0]?.title || this.intl.t('views.app.issue.detail.linkedIssues.linkModal.failed')
				});
			} else {
				linked.push(row);
			}
		});
		this.selection.set(linked.map((row) => row.issue.id), false);
		this.linkedIds = [...this.linkedIds, ...linked.map((row) => String(row.issue.id))];
		this.results = this.results.filter((issue) => !linked.some((row) => row.issue.id === issue.id));
		this.rows = failed;
		if (linked.length) {
			(this.args.onChange ?? this.args.onLinked)?.();
		}
		return failed.length === 0;
	}
}
