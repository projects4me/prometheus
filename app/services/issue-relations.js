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
		return this._rows(row.issue, row.relation, row.depth + 1, row.issue, row.path);
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
