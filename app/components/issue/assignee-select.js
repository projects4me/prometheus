import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import AppComponent from 'prometheus/components/app';

/**
 * Shows an issue's assignee and lets the user pick another project member.
 * Used by the issue details and by the task board's issue cards.
 *
 * @class IssueAssigneeSelectComponent
 * @namespace Prometheus.Components
 * @extends Prometheus.Components.App
 */
export default class IssueAssigneeSelectComponent extends AppComponent {
    /**
     * Active project members other than the current assignee.
     *
     * @property availableAssignees
     * @type {Array}
     * @public
     */
    get availableAssignees() {
        if (!this.args.members) {
            return [];
        }

        return this.args.members.filter(member =>
            member.get('id') !== this.args.issue.assignedTo?.get('id') &&
            member.get('accountStatus') === 'active'
        );
    }

    /**
     * Keeps clicks and key presses on the dropdown from reaching the card
     * (quick view, drag).
     *
     * @method stopPropagation
     * @param {Event} event
     * @public
     */
    @action stopPropagation(event) {
        if (this.args.compact) {
            event.stopPropagation();
        }
    }

    /**
     * Handles keyboard activation for assignee dropdown options.
     *
     * @method handleAssigneeOptionKeydown
     * @param {Prometheus.Models.User} newAssignee The new assignee to set
     * @param {KeyboardEvent} event The keyboard event
     * @public
     */
    @action handleAssigneeOptionKeydown(newAssignee, event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.updateAssignee(newAssignee);
        }
    }

    /**
     * Updates the assignee of the issue.
     *
     * @method updateAssignee
     * @param {Prometheus.Models.User} newAssignee The new assignee to set
     * @public
     */
    @action updateAssignee(newAssignee) {
        const issue = this.args.issue;
        const messenger = new Messenger().post({
            message: htmlSafe(this.intl.t('views.app.issue.detail.assigneeUpdating', { name: newAssignee.name })),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });

        issue.assignedTo = newAssignee;
        issue.assignee = newAssignee.id;

        issue.save().then(() => {
            messenger.update({
                message: htmlSafe(this.intl.t('views.app.issue.detail.assigneeUpdated', { name: newAssignee.name })),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });
            this.notifyUpdated(issue);
        }).catch(() => {
            messenger.update({
                message: htmlSafe(this.intl.t('views.app.issue.detail.assigneeUpdateFailed', { name: newAssignee.name })),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
            issue.rollbackAttributes();
            this.notifyUpdated(issue);
        });
    }

    /**
     * Calls the optional @onUpdated callback.
     *
     * @method notifyUpdated
     * @param {Prometheus.Models.Issue} issue
     * @public
     */
    notifyUpdated(issue) {
        if (this.args.onUpdated) {
            this.args.onUpdated(issue);
        }
    }
}
