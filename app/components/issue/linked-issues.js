/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/** The relation groups in chain order: what is above the issue, then (the issue itself), then what is below and the undirected relations. */
const CHAIN = ['parent', 'blockedBy', 'splitFrom', 'children', 'splitInto', 'blocks', 'relates'];

/** Groups shown above the current issue row. */
const ABOVE = 3;

/**
 * The Linked issues box of the issue detail page: every relation of the issue in chain order (parent, blocked by,
 * split from, the issue itself, children, split into, blocks, relates to), the direct ones first. A directional row
 * can be expanded to load the next level in its direction; the rows are inserted under it, indented.
 *
 * The component keeps the flattened rows and the expanded and loading ids and renders AppUi::DataTable with tree
 * rows; the IssueRelations service does the loading.
 *
 * @class IssueLinkedIssuesComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Issue::LinkedIssues @issue={{this.issue}} />
 */
export default class IssueLinkedIssuesComponent extends Component {
	@service issueRelations;
	@service intl;

	@tracked rows = [];
	@tracked expandedIds = [];
	@tracked loadingIds = [];
	@tracked isLoading = true;
	@tracked loadFailed = false;
	@tracked showLink = false;
	@tracked unlinking = null;
	@tracked unlinkError = null;

	/**
	 * The table columns.
	 *
	 * @property columns
	 * @type Array
	 */
	get columns() {
		let t = (key) => this.intl.t(`views.app.issue.detail.linkedIssues.columns.${key}`);
		return [
			{ key: 'issue', label: t('issue') },
			{ key: 'status', label: t('status') },
			{ key: 'assignee', label: t('assignee') },
		];
	}

	/**
	 * The id of the issue the box belongs to.
	 *
	 * @property currentId
	 * @type String
	 */
	get currentId() {
		return String(this.args.issue.id);
	}

	/**
	 * Loads the direct relations and flattens them in chain order, the current issue between the two halves.
	 *
	 * @method load
	 */
	@action
	async load() {
		let issue = this.args.issue;
		this.isLoading = true;
		this.loadFailed = false;
		this.expandedIds = [];
		this.loadingIds = [];
		try {
			let groups = await this.issueRelations.load(issue);
			if (isDestroying(this) || isDestroyed(this)) {
				return;
			}
			let toRows = (names) => names.flatMap((name) => (groups[name] || []).map((row) => this._record(row)));
			let names = CHAIN;
			this.rows = [
				...toRows(names.slice(0, ABOVE)),
				{ id: this.currentId, issue, depth: 1, relation: null, isCurrent: true },
				...toRows(names.slice(ABOVE)),
			];
		} catch {
			if (isDestroying(this) || isDestroyed(this)) {
				return;
			}
			this.rows = [];
			this.loadFailed = true;
		}
		this.isLoading = false;
	}

	@action
	openLink() {
		this.showLink = true;
	}

	@action
	closeLink() {
		this.showLink = false;
	}

	@action
	askUnlink(record) {
		this.unlinkError = null;
		this.unlinking = record;
	}

	@action
	closeUnlink() {
		this.unlinking = null;
	}

	/**
	 * Unlinks the asked row; resolves false (modal stays open) when it fails.
	 *
	 * @method confirmUnlink
	 * @return {Promise<Boolean>}
	 */
	@action
	async confirmUnlink() {
		try {
			await this.issueRelations.unlink(this.args.issue, this.unlinking.source);
		} catch {
			if (!isDestroying(this) && !isDestroyed(this)) {
				this.unlinkError = this.intl.t('views.app.issue.detail.linkedIssues.unlinkModal.failed');
			}
			return false;
		}
		this.changed();
		return true;
	}

	/**
	 * After a link or unlink: reloads the first level and tells the page.
	 *
	 * @method changed
	 */
	@action
	changed() {
		this.load();
		this.args.onChange?.();
	}

	/**
	 * Whether there is anything to show besides the current issue row.
	 *
	 * @property isEmpty
	 * @type Boolean
	 */
	get isEmpty() {
		return !this.rows.some((row) => !row.isCurrent);
	}

	/**
	 * The group a row belongs to; the current row has none.
	 *
	 * @method groupKey
	 * @param {Object} record
	 * @return {String|null}
	 */
	groupKey = (record) => record.relation;

	/**
	 * @method groupLabel
	 * @param {String} key a relation name
	 * @return {String}
	 */
	groupLabel = (key) => this.intl.t(`views.app.issue.detail.linkedIssues.groups.${key}`);

	/**
	 * Whether the row has the Unlink menu: only the direct relations (level 1), not the current row or deeper ones.
	 *
	 * @method hasUnlink
	 * @param {Object} record
	 * @return {Boolean}
	 */
	hasUnlink = (record) => !record.isCurrent && record.depth === 1;

	/**
	 * A row has a caret when it is directional and the last load did not find anything more.
	 *
	 * @method isExpandable
	 * @param {Object} record
	 * @return {Boolean}
	 */
	isExpandable = (record) => !record.isCurrent && record.relation !== 'relates' && !record.exhausted;

	/**
	 * Expands a row, loading the next level, or collapses it, removing every row below it.
	 *
	 * @method toggle
	 * @param {Object} record
	 */
	@action
	async toggle(record) {
		if (this.expandedIds.includes(record.id)) {
			this.expandedIds = this.expandedIds.filter((id) => id !== record.id);
			this.rows = this.rows.filter((row) => !this._isBelow(row, record));
			return;
		}
		this.loadingIds = [...this.loadingIds, record.id];
		this._patch(record, { error: false });
		try {
			let next = await this.issueRelations.loadNext(record.source);
			if (isDestroying(this) || isDestroyed(this)) {
				return;
			}
			let children = next.map((row) => this._record(row));
			let index = this.rows.findIndex((row) => row.id === record.id);
			if (index === -1) {
				return;
			}
			if (!children.length) {
				this._patch(record, { exhausted: true });
			} else {
				this.rows = [...this.rows.slice(0, index + 1), ...children, ...this.rows.slice(index + 1)];
				this.expandedIds = [...this.expandedIds, record.id];
			}
		} catch {
			if (!isDestroying(this) && !isDestroyed(this)) {
				this._patch(record, { error: true });
			}
		} finally {
			if (!isDestroying(this) && !isDestroyed(this)) {
				this.loadingIds = this.loadingIds.filter((id) => id !== record.id);
			}
		}
	}

	/**
	 * Replaces a row by a copy with the changes, keeping its place (tracked state is the array).
	 *
	 * @method _patch
	 * @private
	 */
	_patch(record, changes) {
		this.rows = this.rows.map((row) => (row.id === record.id ? { ...row, ...changes } : row));
	}

	/**
	 * Whether the row was loaded under the given one (its path starts with the row's path).
	 *
	 * @method _isBelow
	 * @private
	 */
	_isBelow(row, parent) {
		return !!row.source && row.id !== parent.id && row.relation === parent.relation && row.source.depth > parent.source.depth && parent.source.path.every((id, i) => row.source.path[i] === id);
	}

	/**
	 * The table record of a service row.
	 *
	 * @method _record
	 * @private
	 */
	_record(row) {
		return {
			id: `${row.relation}:${row.path.join('>')}`,
			issue: row.issue,
			source: row,
			relation: row.relation,
			depth: row.depth,
			guides: Array.from({ length: Math.max(row.depth - 1, 0) }),
			error: false,
			exhausted: false,
			isCurrent: false,
		};
	}

	/**
	 * `#number` for an issue of the current project, `code-number` for one of another project.
	 *
	 * @method label
	 * @param {Issue} issue
	 * @return {String}
	 */
	label = (issue) => (String(issue.projectId) === String(this.args.issue.projectId) ? `#${issue.issueNumber}` : this.code(issue));

	/**
	 * @method code
	 * @param {Issue} issue
	 * @return {String} e.g. `agaia-4836`
	 */
	code(issue) {
		return `${String(issue.projectShortcode || '').toLowerCase()}-${issue.issueNumber}`;
	}
}
