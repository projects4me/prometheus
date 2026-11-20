/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import decodePlanBody, { isProjectReadable, sharedPlanMilestone } from 'prometheus/utils/idea-plan-body';
import { planStatusClass } from 'prometheus/utils/idea/plan-status';
import { service } from '@ember/service';
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
    @service intl;

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
        return planStatusClass(this.displayStatus);
    }

    /**
     * Whether the selected plan is an older version than the latest
     *
     * @property isSuperseded
     * @type Boolean
     * @public
     */
    get isSuperseded() {
        return !!this.selected && Number(this.selected.version) !== Number(this.latest?.version);
    }

    /**
     * The status shown for the selected plan: an older version that was never approved reads as superseded
     * (display only, nothing is saved)
     *
     * @property displayStatus
     * @type String
     * @public
     */
    get displayStatus() {
        let status = this.selected?.status;
        return this.isSuperseded && ['proposed', 'failed'].includes(status) ? 'superseded' : status;
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
                } else {
                    // the link exists but its issue did not load: still created, shown by its key
                    created[link.key] = { unloaded: true };
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
        return !!this.selected && !this.isSuperseded && ['proposed', 'failed'].includes(this.selected.status);
    }

    /**
     * The milestone options of the picker: the names of the open milestones of the idea's project
     *
     * @property milestoneOptions
     * @type Array
     * @public
     */
    get milestoneOptions() {
        return (this.args.milestones ?? []).map(name => ({ value: name, label: name }));
    }

    /**
     * The picked option: the milestone all issues share, nothing when they differ or none is set
     *
     * @property selectedMilestone
     * @type Object
     * @public
     */
    get selectedMilestone() {
        let name = sharedPlanMilestone(this.body.issues);
        return name ? { value: name, label: name } : null;
    }

    /**
     * The placeholder of the picker: Mixed when the issues differ, the default milestone when none is set
     *
     * @property milestonePlaceholderKey
     * @type String
     * @public
     */
    get milestonePlaceholderKey() {
        return sharedPlanMilestone(this.body.issues) === undefined
            ? 'views.app.idea.plan.milestoneMixed'
            : 'views.app.idea.plan.milestoneDefault';
    }

    /**
     * Whether the milestone of the plan is being saved
     *
     * @property isSavingMilestone
     * @type Boolean
     * @public
     */
    @tracked isSavingMilestone = false;

    /**
     * The options the picker shows for the typed text: the open milestones that match it, and a "Create" entry
     * for the typed name when no milestone has it yet, so a plan can go into a milestone that does not exist
     *
     * @method searchMilestones
     * @param {String} term the text typed in the picker
     * @returns {Array}
     * @public
     */
    @action
    searchMilestones(term) {
        let name = String(term ?? '').trim();
        let needle = name.toLowerCase();
        let options = this.milestoneOptions;
        let matches = options.filter(option => option.label.toLowerCase().includes(needle));
        if (name && !options.some(option => option.label.toLowerCase() === needle)) {
            matches.push({ value: name, label: this.intl.t('views.app.idea.plan.milestoneCreate', { name }) });
        }
        return matches;
    }

    /**
     * Emits the picked milestone name for the whole plan; the controller saves it
     *
     * @method pickMilestone
     * @param {Object} option
     * @returns {Promise}
     * @public
     */
    @action
    async pickMilestone(option) {
        if (!option?.value || !this.args.onMilestone) {
            return;
        }
        this.isSavingMilestone = true;
        try {
            await this.args.onMilestone(this.selected, option.value);
        } catch {
            // Already reported and rolled back by the controller.
        } finally {
            if (!this.isDestroying && !this.isDestroyed) {
                this.isSavingMilestone = false;
            }
        }
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
     * The id and status of the shown plan as one value, so a change of either is seen by `on-update`
     *
     * @property shownKey
     * @type String
     * @private
     */
    get shownKey() {
        return `${this.selected?.id ?? ''}|${this.selected?.status ?? ''}`;
    }

    /**
     * The id of the plan shown at the last change, to tell a status change from a version switch
     *
     * @property lastShownId
     * @type String
     * @private
     */
    lastShownId = this.selected?.id;

    /**
     * Calls `@onPlanSettled` when the shown plan itself (not a switch to another version) becomes created or
     * failed, so the page can reload the issues created from it
     *
     * @method shownStatusChanged
     * @private
     */
    @action
    shownStatusChanged() {
        let plan = this.selected;
        let previousId = this.lastShownId;
        this.lastShownId = plan?.id;
        if (plan && previousId === plan.id && ['created', 'failed'].includes(plan.status)) {
            this.args.onPlanSettled?.(plan);
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
