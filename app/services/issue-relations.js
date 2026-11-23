/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';

const LIMIT = 50;

/**
 * How each relation group is found, from the issue it hangs on. `kind` is how the next issues are loaded:
 * `parent` through `issue.parentissue`, `children` through `Issue.parentId`, `link` through the issuelink query
 * (`type`, the side the issue is on in `from`, the side the shown issue is on in `to`).
 */
const RELATIONS = {
	parent: { kind: 'parent' },
	blockedBy: { kind: 'link', type: 'blocks', from: 'target', to: 'source' },
	splitFrom: { kind: 'link', type: 'splits', from: 'target', to: 'source' },
	children: { kind: 'children' },
	splitInto: { kind: 'link', type: 'splits', from: 'source', to: 'target' },
	blocks: { kind: 'link', type: 'blocks', from: 'source', to: 'target' }
};

/**
 * How a relation chosen in the Link issue modal is stored. `type` is the issuelink type, `swap` puts the other issue
 * on the source side; parent/child relations are not links, they set `Issue.parentId`.
 */
const LINK_KINDS = {
	blocks: { type: 'blocks', swap: false },
	blockedBy: { type: 'blocks', swap: true },
	relates: { type: 'relates', swap: false },
	splitsInto: { type: 'splits', swap: false },
	splitFrom: { type: 'splits', swap: true },
	parentOf: { parent: 'self' },
	childOf: { parent: 'other' }
};

/**
 * Loads the relations of an issue for the issue detail page: the direct ones first and, on demand, one more level
 * in the same direction. Application layer: components ask this service and never query the store for links.
 *
 * A row is `{ issue, link, relation, depth, via, path }`: `link` is the Issuelink (null for parent and child),
 * `relation` is one of parent, blockedBy, splitFrom, children, splitInto, blocks, relates, `via` is the issue the row
 * was reached through (null for direct rows) and `path` the ids from the page's issue to this row's issue.
 *
 * @class IssueRelationsService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class IssueRelationsService extends Service {
	@service store;

	/**
	 * The direct relations of the issue, grouped by relation. Each group holds at most 50 rows.
	 *
	 * @method load
	 * @param {Issue} issue
	 * @return {Promise<Object>} `{ parent, blockedBy, splitFrom, children, splitInto, blocks, relates }`, each an array of rows
	 */
	async load(issue) {
		let names = [...Object.keys(RELATIONS), 'relates'];
		let groups = await Promise.all(names.map((relation) => this._rows(issue, relation, 1, null, [String(issue.id)])));
		await this._loadAssignees(groups.flat());
		return Object.fromEntries(names.map((relation, index) => [relation, groups[index]]));
	}

	/**
	 * The next level of a row, in the row's own direction. Relates rows are not expandable, and an issue already on
	 * the row's path is skipped so a cycle cannot loop.
	 *
	 * @method loadNext
	 * @param {Object} row
	 * @return {Promise<Object[]>} rows with depth + 1 and via = the row's issue
	 */
	async loadNext(row) {
		if (row.relation === 'relates') {
			return [];
		}
		let rows = await this._rows(row.issue, row.relation, row.depth + 1, row.issue, row.path);
		await this._loadAssignees(rows);
		return rows;
	}

	/**
	 * Loads the assignees of the issues of a level of rows in one query. Issues without an assignee and issues whose
	 * assignee is already loaded are left out.
	 *
	 * @method _loadAssignees
	 * @private
	 */
	async _loadAssignees(rows) {
		let issues = [...new Map(rows.map(({ issue }) => [String(issue.id), issue])).values()].filter(
			(issue) => issue.assignee && !issue.belongsTo('assignedTo').value()
		);
		if (!issues.length) {
			return;
		}
		let query = issues.map((issue) => `(Issue.id : ${issue.id})`).join(' OR ');
		await this.store.query('issue', { query: `(${query})`, rels: 'assignedTo', limit: issues.length });
	}

	/**
	 * The open blockers of an issue: the source issues of its `blocks` links whose status is not a done status of
	 * the source issue's own project. The statuses of each project are loaded once per call.
	 *
	 * @method openBlockers
	 * @param {Issue} issue
	 * @return {Promise<Issue[]>}
	 */
	async openBlockers(issue) {
		let links = await this._links('target', issue, 'blocks');
		let blockers = (await Promise.all(links.map((link) => link.sourceIssue))).filter(Boolean);
		let projectIds = [...new Set(blockers.map((blocker) => String(blocker.projectId)))];
		let doneByProject = new Map(
			await Promise.all(
				projectIds.map(async (projectId) => {
					let statuses = await this.store.query('issuestatus', { query: `(Issuestatus.projectId : ${projectId})`, limit: 100 });
					return [projectId, new Set(statuses.slice().filter((status) => String(status.done) === '1').map((status) => status.name))];
				})
			)
		);
		return blockers.filter((blocker) => !doneByProject.get(String(blocker.projectId)).has(blocker.status));
	}

	/**
	 * Links the issue to another one. `relation` is one of blocks, blockedBy, relates, splitsInto, splitFrom,
	 * parentOf, childOf. Typed links create an Issuelink; parent/child set the child's `parentId`. A failed save
	 * is rolled back and the error (Gaia's 422) is rethrown.
	 *
	 * @method link
	 * @param {Issue} issue
	 * @param {String} relation
	 * @param {Issue} other
	 * @return {Promise}
	 */
	async link(issue, relation, other) {
		let kind = LINK_KINDS[relation];
		if (!kind) {
			throw new Error(`Unknown relation ${relation}`);
		}
		if (kind.parent) {
			let [child, parent] = kind.parent === 'self' ? [other, issue] : [issue, other];
			return this._setParent(child, parent);
		}
		let [source, target] = kind.swap ? [other, issue] : [issue, other];
		let record = this.store.createRecord('issuelink', {
			type: kind.type,
			sourceIssueId: String(source.id),
			targetIssueId: String(target.id),
			projectId: String(source.projectId),
			targetProjectId: String(target.projectId)
		});
		try {
			return await record.save();
		} catch (error) {
			record.unloadRecord();
			throw error;
		}
	}

	/**
	 * Removes a direct row: deletes its Issuelink, or clears `parentId` for a parent or child row.
	 *
	 * @method unlink
	 * @param {Issue} issue the page's issue
	 * @param {Object} row a depth-1 row from load()
	 * @return {Promise}
	 */
	async unlink(issue, row) {
		if (row.link) {
			return row.link.destroyRecord();
		}
		if (row.relation === 'parent') {
			return this._setParent(issue, null);
		}
		if (row.relation === 'children') {
			return this._setParent(row.issue, null);
		}
		throw new Error(`Cannot unlink ${row.relation}`);
	}

	/**
	 * @method _setParent
	 * @private
	 */
	async _setParent(child, parent) {
		child.parentId = parent ? String(parent.id) : null;
		child.parentissue = parent;
		try {
			return await child.save();
		} catch (error) {
			child.rollbackAttributes();
			throw error;
		}
	}

	/**
	 * @method _rows
	 * @private
	 */
	async _rows(issue, relation, depth, via, path) {
		let found = relation === 'relates' ? await this._relates(issue) : await this._found(issue, relation);
		return found
			.filter(({ issue: other }) => other && !path.includes(String(other.id)))
			.slice(0, LIMIT)
			.map(({ issue: other, link }) => ({ issue: other, link, relation, depth, via, path: [...path, String(other.id)] }));
	}

	/**
	 * @method _found
	 * @private
	 */
	async _found(issue, relation) {
		let definition = RELATIONS[relation];
		if (definition.kind === 'parent') {
			let parent = issue.parentId ? await issue.parentissue : null;
			return parent ? [{ issue: parent, link: null }] : [];
		}
		if (definition.kind === 'children') {
			let children = await this.store.query('issue', { query: `(Issue.parentId : ${issue.id})`, limit: LIMIT });
			return children.slice().map((child) => ({ issue: child, link: null }));
		}
		let links = await this._links(definition.from, issue, definition.type);
		return Promise.all(links.map(async (link) => ({ issue: await link[`${definition.to}Issue`], link })));
	}

	/**
	 * Relates links count in either direction.
	 *
	 * @method _relates
	 * @private
	 */
	async _relates(issue) {
		let [asSource, asTarget] = await Promise.all([this._links('source', issue, 'relates'), this._links('target', issue, 'relates')]);
		return Promise.all([
			...asSource.map(async (link) => ({ issue: await link.targetIssue, link })),
			...asTarget.map(async (link) => ({ issue: await link.sourceIssue, link }))
		]);
	}

	/**
	 * @method _links
	 * @private
	 */
	async _links(side, issue, type) {
		let links = await this.store.query('issuelink', {
			query: `((Issuelink.${side}IssueId : ${issue.id}) AND (Issuelink.type : ${type}))`,
			rels: 'sourceIssue,targetIssue',
			limit: LIMIT
		});
		return links.slice();
	}
}
