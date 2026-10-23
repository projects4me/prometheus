/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Builds the URL of the issue a notification context points to
 *
 * @method issueLink
 * @param {Object} context Notification context
 * @return {String|null} URL to the issue, null when the context has no issue
 * @public
 */
export default function issueLink(context) {
	if (!context?.projectShortcode || !context?.issueNumber) {
		return null;
	}
	return `/app/project/${context.projectShortcode.toLowerCase()}/issue/${
		context.issueNumber
	}`;
}
