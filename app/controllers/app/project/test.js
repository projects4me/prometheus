import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AppProjectTestController extends Controller {
    statuses = [
        'new',
        'in_progress',
        'done',
        'feedback',
        'pending',
        'deferred'
    ];

    @service router;

    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    statusClass = {
        new: 'box-info',
        in_progress: 'box-primary',
        done: 'box-success',
        feedback: 'box-warning',
        pending: 'box-danger',
        deferred: ''
    };

    @action openIssue(issue) {
        Logger.debug("AppProjectBoardController::openIssue");
        this.router.transitionTo('app.project.test.issue', { queryParams: { issueNumber: issue.issueNumber } });
        Logger.debug("-AppProjectBoardController::openIssue");
    }

    @action updateIssue(issueEl, el, updateArray) {
        Logger.debug("AppProjectBoardController::updateIssue");
        let _self = this;
        //Logger.debug('The issue received is', issue);
        Logger.debug('The element that was dragged is', el);

        // Update the status in the card
        let laneMilestoneId = el.getAttribute('data-field-milestone-id');
        let status = el.parentElement.children[0].getAttribute('data-field-status');
        let issueId = issueEl.getAttribute('data-field-issue-id');
        let issueMilestoneId = issueEl.getAttribute('data-field-issue-milestone');

        let milestone = this.store.peekRecord('milestone', issueMilestoneId);
        let issue = milestone.issues.findBy('id', issueId);
        issue.set('status', status);
        let issueMilestoneChanged = false;
        if (laneMilestoneId != issueMilestoneId) {
            issue.set('milestoneId', laneMilestoneId);
            issueMilestoneChanged = true;
        }
        issue.save();
        Logger.debug("AppProjectBoardController::updateIssue");
    }
}
