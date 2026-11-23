/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/** How many blockers are named before "+N". */
const SHOWN = 2;

/**
 * The "Blocked by" label of the issue detail header: the first two open blockers as links, then "+N". Hidden while
 * loading and when nothing blocks the issue.
 *
 * @class IssueBlockedByLabelComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Issue::BlockedByLabel @issue={{this.issue}} @refreshKey={{this.version}} />
 */
export default class IssueBlockedByLabelComponent extends Component {
	@service issueRelations;

	@tracked blockers = [];
	@tracked isLoading = true;

	/** Counter of the latest load, so a slow older response cannot overwrite a newer one. */
	requestId = 0;

	get shown() {
		return this.blockers.slice(0, SHOWN).map((issue) => ({
			issue,
			text: String(issue.projectId) === String(this.args.issue.projectId) ? `#${issue.issueNumber}` : `${String(issue.projectShortcode || '').toLowerCase()}-${issue.issueNumber}`,
		}));
	}

	get more() {
		return Math.max(this.blockers.length - SHOWN, 0);
	}

	@action
	async load() {
		this.isLoading = true;
		const request = ++this.requestId;
		let blockers;
		try {
			blockers = await this.issueRelations.openBlockers(this.args.issue);
		} catch (error) {
			// A failed load hides the label, but is logged so it is not mistaken for "nothing blocks this issue".
			console.error('Could not load the blockers of the issue', error);			blockers = [];
		}
		// Ignore the result when the component is gone or a newer load has started.
		if (isDestroying(this) || isDestroyed(this) || request !== this.requestId) {
			return;
		}
		this.blockers = blockers;
		this.isLoading = false;
	}
}
