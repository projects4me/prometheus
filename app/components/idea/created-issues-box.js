/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import decodePlanBody, { isProjectReadable } from 'prometheus/utils/idea-plan-body';

/**
 * The created issues box of an idea page: the issues created from the plans, grouped by plan version.
 *
 * @class IdeaCreatedIssuesBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaCreatedIssuesBoxComponent extends Component {
    /**
     * The links of the idea grouped by the version of their plan, the oldest version first
     *
     * @property groups
     * @type Array
     * @public
     */
    get groups() {
        let byVersion = new Map();
        let itemsByPlan = new Map();
        (this.args.planIssues ?? []).forEach(link => {
            let plan = (this.args.plans ?? []).find(item => item.id === link.ideaplanId);
            let version = plan ? Number(plan.version) : 0;
            if (!byVersion.has(version)) {
                byVersion.set(version, []);
            }
            if (plan && !itemsByPlan.has(plan.id)) {
                itemsByPlan.set(plan.id, decodePlanBody(plan.body).issues ?? []);
            }
            byVersion.get(version).push(this.describe(link, itemsByPlan.get(plan?.id) ?? []));
        });
        return [...byVersion.entries()]
            .sort(([a], [b]) => a - b)
            .map(([version, links]) => ({ version, links }));
    }

    /**
     * Describes a created issue link for display. The issue is linked only when its project is readable.
     * A link without a loaded issue shows the key and subject of the plan item it came from.
     *
     * @method describe
     * @param {Object} link the ideaplanissue
     * @param {Array} planItems the decoded issue items of the plan of the link
     * @returns {Object}
     * @private
     */
    describe(link, planItems) {
        let issue = link.issue;
        if (!issue) {
            let item = planItems.find(candidate => candidate.key === link.key);
            return { id: link.id, label: link.key, subject: item?.subject, readable: false };
        }
        return {
            id: link.id,
            projectShortcode: issue.projectShortcode,
            issueNumber: issue.issueNumber,
            label: `${issue.projectShortcode}-${issue.issueNumber}`,
            subject: issue.subject,
            readable: isProjectReadable(issue.projectId, this.args.readableProjectIds)
        };
    }
}
