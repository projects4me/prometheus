/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The typed issue links of a project, indexed by issue id for the Gantt. Links are kept in a tracked list, so a
 * chart reading the lookup redraws after `add` or `remove`. Links whose source or target issue is missing are
 * ignored.
 *
 * @class IssueLinkLookup
 * @namespace Prometheus.Utils.Gantt
 */
export default class IssueLinkLookup {
	@tracked _links = [];

	/**
	 * @param {Issuelink[]} links
	 * @param {Object} options
	 * @param {Function} options.isOpen `(issue) => Boolean`, whether the issue is not in a done status
	 * @param {String|Number} options.projectId the project the lookup was loaded for
	 */
	constructor(links = [], { isOpen = () => true, projectId = null } = {}) {
		this._links = links.slice();
		this._isOpen = isOpen;
		this.projectId = projectId;
	}

	/**
	 * Every link of the lookup.
	 *
	 * @property links
	 * @type Issuelink[]
	 */
	get links() {
		return this._links;
	}

	/**
	 * The issues of other projects that appear in the links.
	 *
	 * @property externalIssues
	 * @type Issue[]
	 */
	get externalIssues() {
		let found = new Map();
		for (let link of this._links) {
			for (let issue of [link.belongsTo('sourceIssue').value(), link.belongsTo('targetIssue').value()]) {
				if (issue && String(issue.projectId) !== String(this.projectId)) {
					found.set(String(issue.id), issue);
				}
			}
		}
		return [...found.values()];
	}

	/** Links of `type` where the issue is on the `side` ('source' or 'target'). */
	_of(issueId, type, side) {
		let relation = `${side}Issue`;
		return this._links.filter((link) => link.type === type && String(link.belongsTo(relation).id()) === String(issueId));
	}

	/** The `blocks` links that block the issue (it is their target). */
	blockedBy(issueId) {
		return this._of(issueId, 'blocks', 'target');
	}

	/** The `blocks` links the issue is the blocker of (it is their source). */
	blocks(issueId) {
		return this._of(issueId, 'blocks', 'source');
	}

	/** The `splits` links the issue was split from (it is their target). */
	splitFrom(issueId) {
		return this._of(issueId, 'splits', 'target');
	}

	/** The `splits` links the issue was split into (it is their source). */
	splitInto(issueId) {
		return this._of(issueId, 'splits', 'source');
	}

	/** The `relates` links on either side of the issue. */
	relates(issueId) {
		return [...this._of(issueId, 'relates', 'source'), ...this._of(issueId, 'relates', 'target')];
	}

	/**
	 * Whether the issue is not in a done status of its own project.
	 *
	 * @method isOpen
	 * @param {Issue} issue
	 * @return {Boolean}
	 */
	isOpen(issue) {
		return this._isOpen(issue);
	}

	/**
	 * Adds a link (once per id), so the chart redraws.
	 *
	 * @method add
	 * @param {Issuelink} link
	 */
	add(link) {
		if (!this._links.some((existing) => existing.id === link.id)) {
			this._links = [...this._links, link];
		}
	}

	/**
	 * Removes a link, so the chart redraws.
	 *
	 * @method remove
	 * @param {Issuelink} link
	 */
	remove(link) {
		this._links = this._links.filter((existing) => existing.id !== link.id);
	}
}
