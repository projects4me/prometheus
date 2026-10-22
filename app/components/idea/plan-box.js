/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const STATUS_LABELS = {
    proposed: 'new',
    approved: 'in_review',
    creating: 'in_progress',
    created: 'done',
    failed: 'closed',
    superseded: 'deferred'
};

/**
 * The plan box of an idea page: the versions of the plan as tabs, the summary and the planned issues of the
 * selected version, and the approve button of the latest version. It only presents, the controller saves.
 *
 * @class IdeaPlanBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaPlanBoxComponent extends Component {
    /**
     * The version the user picked, the latest one by default
     *
     * @property pickedVersion
     * @type Number
     * @private
     */
    @tracked pickedVersion = null;

    /**
     * The latest version when the user picked, a newer version cancels the pick
     *
     * @property pickedAtLatest
     * @type Number
     * @private
     */
    @tracked pickedAtLatest = null;

    /**
     * The key of the planned issue that is expanded
     *
     * @property expandedKey
     * @type String
     * @private
     */
    @tracked expandedKey = null;

    /**
     * Whether the approve confirmation is open
     *
     * @property showApproveModal
     * @type Boolean
     * @private
     */
    @tracked showApproveModal = false;

    /**
     * The plans, the oldest version first
     *
     * @property versions
     * @type Array
     * @public
     */
    get versions() {
        return [...(this.args.plans ?? [])].sort((a, b) => Number(a.version) - Number(b.version));
    }

    /**
     * The latest plan
     *
     * @property latest
     * @type Prometheus.Models.Ideaplan
     * @public
     */
    get latest() {
        return this.versions[this.versions.length - 1];
    }

    /**
     * The plan that is shown
     *
     * @property selected
     * @type Prometheus.Models.Ideaplan
     * @public
     */
    get selected() {
        let picked = this.pickedAtLatest === Number(this.latest?.version) ? this.pickedVersion : null;
        return this.versions.find(plan => Number(plan.version) === picked) ?? this.latest;
    }

    /**
     * The decoded body of the selected plan: the summary and the planned issues
     *
     * @property body
     * @type Object
     * @public
     */
    get body() {
        let body = this.selected?.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (error) {
                body = { summary: body };
            }
        }
        body = body && typeof body === 'object' ? body : {};
        let issues = Array.isArray(body.issues) ? body.issues : [];
        return {
            summary: body.summary ?? '',
            issues: issues.map((issue, index) => ({
                ...issue,
                key: issue.key ?? `issue-${index}`,
                dependsOn: Array.isArray(issue.dependsOn) ? issue.dependsOn.join(', ') : (issue.dependsOn ?? '')
            }))
        };
    }

    /**
     * The status class of the selected plan, reusing the classes of the issue statuses
     *
     * @property statusClass
     * @type String
     * @public
     */
    get statusClass() {
        return STATUS_LABELS[this.selected?.status] ?? 'new';
    }

    /**
     * Whether the selected plan is the latest and can still be approved
     *
     * @property canApprove
     * @type Boolean
     * @public
     */
    get canApprove() {
        return !!this.selected && this.selected === this.latest && ['proposed', 'failed'].includes(this.selected.status);
    }

    /**
     * Shows the plan of a version
     *
     * @method pick
     * @param {Number} version
     * @param {Event} event
     * @public
     */
    @action
    pick(version, event) {
        event?.preventDefault();
        this.pickedVersion = Number(version);
        this.pickedAtLatest = Number(this.latest?.version);
        this.expandedKey = null;
    }

    /**
     * Expands or collapses a planned issue
     *
     * @method toggle
     * @param {String} key
     * @public
     */
    @action
    toggle(key) {
        this.expandedKey = this.expandedKey === key ? null : key;
    }

    /**
     * @method askApprove
     * @public
     */
    @action
    askApprove() {
        this.showApproveModal = true;
    }

    /**
     * @method closeApprove
     * @public
     */
    @action
    closeApprove() {
        this.showApproveModal = false;
    }

    /**
     * Approves the selected plan after the confirmation
     *
     * @method confirmApprove
     * @returns {Promise}
     * @public
     */
    @action
    async confirmApprove() {
        this.showApproveModal = false;
        try {
            await this.args.onApprove(this.selected);
        } catch (error) {
            // Already reported and rolled back by the controller.
        }
    }
}
