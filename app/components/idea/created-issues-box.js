/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

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
        (this.args.planIssues ?? []).forEach(link => {
            let plan = (this.args.plans ?? []).find(item => item.id === link.ideaplanId);
            let version = plan ? Number(plan.version) : 0;
            if (!byVersion.has(version)) {
                byVersion.set(version, []);
            }
            byVersion.get(version).push(link);
        });
        return [...byVersion.entries()]
            .sort(([a], [b]) => a - b)
            .map(([version, links]) => ({ version, links }));
    }
}
