/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/** How many blockers are named before "+N". */
const SHOWN = 2;

/**
 * The red "Blocked by" tag: the first two blockers as links (`#n`, or `code-n` for another project), then "+N".
 * Presentational: shared by the issue detail label and the board cards. Renders nothing without blockers.
 *
 * @class IssueBlockedByTagComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Issue::BlockedByTag @blockers={{this.blockers}} @projectId={{@issue.projectId}} />
 */
export default class IssueBlockedByTagComponent extends Component {
	get shown() {
		return (this.args.blockers ?? []).slice(0, SHOWN).map((issue) => ({
			issue,
			text: String(issue.projectId) === String(this.args.projectId) ? `#${issue.issueNumber}` : `${String(issue.projectShortcode || '').toLowerCase()}-${issue.issueNumber}`,
		}));
	}

	get more() {
		return Math.max((this.args.blockers ?? []).length - SHOWN, 0);
	}
}
