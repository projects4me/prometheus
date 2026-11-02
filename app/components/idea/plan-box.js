/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import decodePlanBody, { isProjectReadable } from 'prometheus/utils/idea-plan-body';
import { planStatusClass } from 'prometheus/utils/idea/plan-status';
import { tracked } from '@glimmer/tracking';

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
     * The request to show a plan that the user had already answered with a pick
     *
     * @property answeredShownPlan
     * @type Object
     * @private
     */
    @tracked answeredShownPlan = null;

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
     * Whether the approval is being saved
     *
     * @property isApproving
     * @type Boolean
     * @private
     */
    @tracked isApproving = false;

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
        let request = this.args.shownPlan;
        if (request && request !== this.answeredShownPlan) {
            let shown = this.versions.find(plan => String(plan.id) === String(request.id));
            if (shown) {
                return shown;
            }
        }
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
        let body = decodePlanBody(this.selected?.body);
        let issues = Array.isArray(body.issues) ? body.issues : [];
        return {
            summary: body.summary ?? '',
            issues: issues.map((issue, index) => ({
                ...issue,
                key: issue.key ?? `issue-${index}`,
                projectLabel: issue.projectCode ?? issue.project,
                dependsOn: Array.isArray(issue.dependsOn) ? issue.dependsOn.join(', ') : (issue.dependsOn ?? ''),
                screenKeys: Array.isArray(issue.screens) ? issue.screens : [],
                screens: Array.isArray(issue.screens) ? issue.screens.join(', ') : ''
            }))
        };
    }

    /**
     * The screens the shown version lists, each key once, resolved to its latest version in the idea messages
     *
     * @property screens
     * @type Array
     * @public
     */
    get screens() {
        let latest = {};
        (this.args.messages ?? []).forEach(message => {
            let screens = get(message, 'screens');
            (Array.isArray(screens) ? screens : []).forEach(screen => {
                if (screen?.uploadId && screen.key !== undefined && (!latest[screen.key] || Number(screen.version) >= Number(latest[screen.key].version))) {
                    latest[screen.key] = screen;
                }
            });
        });
        let keys = [];
        (this.body.issues ?? []).forEach(issue => {
            issue.screenKeys.forEach(key => {
                if (!keys.includes(key)) {
                    keys.push(key);
                }
            });
        });
        return keys.map(key => ({ key, screen: latest[key] }));
    }

    /**
     * The status class of the selected plan, reusing the classes of the issue statuses
     *
     * @property statusClass
     * @type String
     * @public
     */
    get statusClass() {
        return planStatusClass(this.selected?.status);
    }

    /**
     * The issues created from the shown version, by the key of the plan issue they came from
     *
     * @property createdIssues
     * @type Object
     * @public
     */
    get createdIssues() {
        let created = {};
        (this.args.planIssues ?? [])
            .filter(link => link.ideaplanId === this.selected?.id)
            .forEach(link => {
                let issue = link.loadedIssue;
                let issueNumber = issue?.issueNumber;
                let projectShortcode = String(issue?.projectShortcode ?? '').toLowerCase();
                if (issueNumber && projectShortcode) {
                    created[link.key] = {
                        projectShortcode,
                        issueNumber,
                        readable: isProjectReadable(issue.projectId, this.readableProjectIds)
                    };
                }
            });
        return created;
    }

    /**
     * The ids of the projects the user can read, passed by the idea page
     *
     * @property readableProjectIds
     * @type Array
     * @public
     */
    get readableProjectIds() {
        return this.args.readableProjectIds ?? [];
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
        this.answeredShownPlan = this.args.shownPlan ?? null;
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
     * Toggles a planned issue from the keyboard (Enter or Space)
     *
     * @method toggleOnKey
     * @param {String} key
     * @param {KeyboardEvent} event
     * @public
     */
    @action
    toggleOnKey(key, event) {
        if (event.target !== event.currentTarget) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggle(key);
        }
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
     * Approves the selected plan after the confirmation. The modal shows its busy state until the
     * approval is saved and closes then; a rejection keeps it open.
     *
     * @method confirmApprove
     * @returns {Promise<Boolean>} true once the approval is saved, false when it failed
     * @public
     */
    @action
    async confirmApprove() {
        this.isApproving = true;
        try {
            await this.args.onApprove(this.selected);
            return true;
        } catch (error) {
            // Already reported and rolled back by the controller.
            return false;
        } finally {
            this.isApproving = false;
        }
    }

    /**
     * Whether issues are being created from the selected plan
     *
     * @property isCreating
     * @type Boolean
     * @public
     */
    get isCreating() {
        return ['approved', 'creating'].includes(this.selected?.status);
    }
}
