/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { format as formatDate } from 'prometheus/utils/date';
import decodePlanBody, { isProjectReadable } from 'prometheus/utils/idea-plan-body';

/**
 * The created issues box of an idea page: the issues created from the plans, grouped by plan version.
 *
 * @class IdeaCreatedIssuesBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaCreatedIssuesBoxComponent extends Component {
    @service store;

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
                let issues = decodePlanBody(plan.body).issues;
                itemsByPlan.set(plan.id, Array.isArray(issues) ? issues : []);
            }
            byVersion.get(version).push(this.describe(link, itemsByPlan.get(plan?.id) ?? []));
        });
        return [...byVersion.entries()]
            .sort(([a], [b]) => a - b)
            .map(([version, links]) => {
                let plan = (this.args.plans ?? []).find(item => Number(item.version) === version);
                return {
                    version,
                    dateLabel: plan?.dateCreated ? formatDate(plan.dateCreated, "DD MMM 'YY") : '',
                    total: links.length,
                    done: links.filter(link => link.done).length,
                    links
                };
            });
    }

    /**
     * The total number of created issues
     *
     * @property total
     * @type Number
     * @public
     */
    get total() {
        return (this.args.planIssues ?? []).length;
    }

    /**
     * Whether the issuestatus record of the given status name has the done flag. An unknown status is not done.
     *
     * @method isDone
     * @param {String} statusName
     * @returns {Boolean}
     * @private
     */
    isDone(statusName) {
        let status = this.store.peekAll('issuestatus').find(item => item.name === statusName);
        return !!status && ['1', 'true'].includes(String(status.done).toLowerCase());
    }

    /**
     * The name of the type of an issue, from the loaded type record
     *
     * @method typeName
     * @param {Object} issue
     * @returns {String|undefined}
     * @private
     */
    typeName(issue) {
        let type = issue.typeId ? this.store.peekRecord('issuetype', issue.typeId) : null;
        return type?.name ?? issue.issuetype?.name;
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
        let issue = link.loadedIssue;
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
            status: issue.status,
            priority: issue.priority,
            typeName: this.typeName(issue),
            done: this.isDone(issue.status),
            readable: isProjectReadable(issue.projectId, this.args.readableProjectIds)
        };
    }
}
