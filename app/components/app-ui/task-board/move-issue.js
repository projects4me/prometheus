/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The Move modal of a board card: change the status, assignee and milestone of an issue from full-width
 * lists. Data in, events out: the choices are staged and `@onSave(changes)` receives only the fields that
 * changed (`statusId` and `status`, `assignee`, `milestoneId`); the component never saves the issue itself.
 * The assignee and milestone lists open as a second modal and return to this one when a row is picked.
 *
 * Args: `@issue`, `@statuses` (the lane statuses), `@members`, `@milestones` (open milestones and Backlog,
 * the Backlog having no id), `@onSave`, `@onClose`.
 *
 * @class AppUiTaskBoardMoveIssueComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiTaskBoardMoveIssueComponent extends Component {

    /**
     * The staged status id, or null while it is unchanged
     *
     * @property stagedStatusId
     * @type String
     * @private
     */
    @tracked stagedStatusId = null;

    /**
     * The staged assignee id, or null while it is unchanged
     *
     * @property stagedAssignee
     * @type String
     * @private
     */
    @tracked stagedAssignee = null;

    /**
     * The staged milestone id (empty string for Backlog), or null while it is unchanged
     *
     * @property stagedMilestoneId
     * @type String
     * @private
     */
    @tracked stagedMilestoneId = null;

    /**
     * Which picker is open: `assignee`, `milestone` or null
     *
     * @property picker
     * @type String
     * @private
     */
    @tracked picker = null;

    /**
     * The picker's search text
     *
     * @property query
     * @type String
     * @private
     */
    @tracked query = '';

    /**
     * The status rows with their current / selected flags
     *
     * @property statusRows
     * @type Array
     * @public
     */
    get statusRows() {
        let current = this.currentStatusId;
        let selected = this.selectedStatusId;

        return (this.args.statuses ?? []).map((status) => ({
            status,
            id: String(status.id),
            isCurrent: String(status.id) === current,
            isSelected: String(status.id) === selected
        }));
    }

    get currentStatusId() {
        let issue = this.args.issue;
        if (issue?.statusId) {
            return String(issue.statusId);
        }
        let match = (this.args.statuses ?? []).find((status) => status.name === issue?.status);

        return match ? String(match.id) : null;
    }

    get selectedStatusId() {
        return this.stagedStatusId ?? this.currentStatusId;
    }

    get selectedAssigneeId() {
        return this.stagedAssignee ?? this.args.issue?.assignee ?? null;
    }

    /**
     * The member shown in the Assignee row
     *
     * @property assigneeMember
     * @type Object
     * @public
     */
    get assigneeMember() {
        let id = this.selectedAssigneeId;

        return (this.args.members ?? []).find((member) => String(member.id) === String(id)) ?? null;
    }

    get selectedMilestoneId() {
        return String(this.stagedMilestoneId ?? this.args.issue?.milestoneId ?? '');
    }

    /**
     * The milestone shown in the Milestone row
     *
     * @property selectedMilestone
     * @type Object
     * @public
     */
    get selectedMilestone() {
        let id = this.selectedMilestoneId;

        return (this.args.milestones ?? []).find((milestone) => String(milestone.id ?? '') === id) ?? null;
    }

    get hasChanges() {
        return Object.keys(this.changes).length > 0;
    }

    /**
     * Only the fields the user changed
     *
     * @property changes
     * @type Object
     * @public
     */
    get changes() {
        let changes = {};
        let issue = this.args.issue;

        if (this.stagedStatusId !== null && this.stagedStatusId !== this.currentStatusId) {
            let status = (this.args.statuses ?? []).find((item) => String(item.id) === this.stagedStatusId);
            changes.statusId = this.stagedStatusId;
            changes.status = status?.name;
        }
        if (this.stagedAssignee !== null && this.stagedAssignee !== String(issue?.assignee ?? '')) {
            changes.assignee = this.stagedAssignee;
        }
        if (this.stagedMilestoneId !== null && this.stagedMilestoneId !== String(issue?.milestoneId ?? '')) {
            changes.milestoneId = this.stagedMilestoneId;
        }

        return changes;
    }

    /**
     * The picker's rows, filtered by the search text
     *
     * @property pickerRows
     * @type Array
     * @public
     */
    get pickerRows() {
        let isAssignee = this.picker === 'assignee';
        let items = (isAssignee ? this.args.members : this.args.milestones) ?? [];
        let term = this.query.trim().toLowerCase();
        let selected = isAssignee ? String(this.selectedAssigneeId ?? '') : this.selectedMilestoneId;

        return items
            .filter((item) => !term || String(item.name ?? '').toLowerCase().includes(term))
            .map((item) => ({
                item,
                isBacklog: !isAssignee && !item.id,
                isSelected: String(item.id ?? '') === selected
            }));
    }

    get isAssigneePicker() {
        return this.picker === 'assignee';
    }

    @action
    selectStatus(id) {
        this.stagedStatusId = String(id);
    }

    @action
    openPicker(picker) {
        this.query = '';
        this.picker = picker;
    }

    @action
    closePicker() {
        this.picker = null;
        this.query = '';
    }

    @action
    search(event) {
        this.query = event.target.value;
    }

    /**
     * Stage the picked member or milestone and return to the Move modal
     *
     * @method pick
     * @param {Object} item
     * @public
     */
    @action
    pick(item) {
        if (this.picker === 'assignee') {
            this.stagedAssignee = String(item.id);
        } else {
            this.stagedMilestoneId = String(item.id ?? '');
        }
        this.closePicker();
    }

    /**
     * Hand the changed fields to the caller; the modal closes unless `@onSave` returns false
     *
     * @method save
     * @return {Boolean|Promise}
     * @public
     */
    @action
    save() {
        let result = this.args.onSave?.(this.changes);

        return result === undefined ? true : result;
    }
}
