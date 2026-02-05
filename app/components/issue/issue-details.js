import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { htmlSafe } from "@ember/template";
import { tracked } from '@glimmer/tracking';
import AppComponent from 'prometheus/components/app';
import RSVP from 'rsvp';

/**
 * This component is used to render the issue details.
 *
 * @class IssueIssueDetailsComponent
 * @namespace Prometheus.Components
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IssueIssueDetailsComponent extends AppComponent {
    /**
     * This flag is used to show or hide the modal dialog box
     * for file previews
     *
     * @property previewFileDialog
     * @type boolean
     * @for IssueIssueDetailsComponent
     * @private
     */
    @tracked previewFileDialog = false;

    /**
     * This flag is used to show or hide the modal dialog box
     * for time log
     *
     * @property logTimeDialog
     * @type boolean
     * @for IssueIssueDetailsComponent
     * @private
     */
    @tracked logTimeDialog = false;

    /**
     * This flag is used to show or hide the modal dialog box
     * for estimate time
     *
     * @property estimateTimeDialog
     * @type boolean
     * @for IssueIssueDetailsComponent
     * @private
     */
    @tracked estimateTimeDialog = false;

    /**
     * This is the container object for a new time log entry
     *
     * @property newLogTime
     * @type Prometheus.Models.Timelog
     * @for IssueIssueDetailsComponent
     * @private
     */
    @tracked newTimeLog = null;

    /**
     * This flag is used to show or hide the modal dialog box
     * for editing time log
     *
     * @property editLogDialog
     * @type boolean
     * @for IssueIssueDetailsComponent
     * @private
     */
    @tracked editLogDialog = false;

    /**
     * This is the container object for a new time log entry
     *
     * @property editingLog
     * @type Prometheus.Models.Timelog
     * @for IssueIssueDetailsComponent
     * @private
     */
    @tracked editingLog = null;

    /**
     * PubSub service is used to provide DDAD.
     *
     * @property pubSub
     * @type Ember.Service
     * @for IssueIssueDetailsComponent
     * @protected
     */
    @service pubSub;   
    
    /**
     * Query params that the controller support.
     *
     * @property queryParams
     * @type Array
     * @for IssueIssueDetailsComponent
     * @public
     */
    queryParams = ['s_id'];


    /**
     * Boolean flag indicating whether the issue planning dialog/modal is open.
     *
     * @property issuePlanDialog
     * @type {Boolean}
     * @public
     */
    @tracked issuePlanDialog = false;

    /**
     * Holds the data returned from the AI issue planning API for the current issue.
     *
     * @property issuePlanData
     * @type {Object|null}
     * @public
     */
    @tracked issuePlanData = null;

    /**
     * Boolean flag indicating whether the issue planning data is currently being loaded.
     *
     * @property issuePlanLoading
     * @type {Boolean}
     * @public
     */
    @tracked issuePlanLoading = false;

    /**
     * Boolean flag indicating whether the add watcher dialog is open.
     *
     * @property addWatcherDialog
     * @type {Boolean}
     * @public
     */
    @tracked addWatcherDialog = false;

    /**
     * The abort controller which will be used to cancel the issue planning api call when user closes the modal.
     * 
     * @property issuePlanningAbortController
     * @type {AbortController}
     * @public
     */
    issuePlanningAbortController = new AbortController();

    constructor() {
        super(...arguments);
        this.newTimeLog = this.store.createRecord('timelog');
    }

    /**
     * The project controller for the issue details.
     *
     * @property projectController
     * @type Prometheus.Controllers.App.Project.Board
     * @public
     */
    get projectController() {
        return this.args.projectController;
    }

    /**
     * The issue for which the details are being displayed.
     *
     * @property issue
     * @type Prometheus.Models.Issue
     * @public
     */
    get issue() {
        return this.args.issue;
    }

    /**
     * Whether to render the issue details in a single column.
     *
     * @property renderSingleColumn
     * @type boolean
     * @public
     */
    get renderSingleColumn() {
        return this.args.renderSingleColumn ?? true;
    }

    /**
     * This is a computed property in which gets the list of users
     * in the system loaded by the project controller
     *
     * @property usersList
     * @type Array
     * @for IssueIssueDetailsComponent
     * @private
     */
    get usersList() {
        return this.projectController.get('membersList');
    }

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for IssueIssueDetailsComponent
     * @private
     */
    get issuesList() {
        return this.projectController.get('issuesList');
    }

    /**
     * This is a task to handle file uploading
     *
     * @param handleUpload
     * @type task
     * @private
     */
    @(task(function* (file) {
        let _self = this;
        Logger.debug('Trying to upload a file');
        let maxFileSize = _self.config.app.upload.maxFileSize;

        if(file.size > maxFileSize) {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.file.uploadFailedSize", { size: maxFileSize / 1024 / 1024 }),
                type: 'error',
                showCloseButton: true
            });
            return;
        }

        let upload = this.store.createRecord('upload', {});

        try {
            let options = {
                url: upload.store.adapterFor('upload').buildURL('upload'),
                data: {
                    relatedTo: 'issue',
                    relatedId: _self.issue.id
                },
                headers: upload.store.adapterFor('upload').headers
            };

            let response = yield file.upload(options);
            let data = yield response.json();
            
            // Update the upload record with the response data
            upload.setProperties({
                id: data.data.id,
                name: data.data.attributes.name,
                fileSize: data.data.attributes.fileSize,
                fileType: data.data.attributes.fileType,
                fileMime: data.data.attributes.fileMime,
                fileThumbnail: data.data.attributes.fileThumbnail
            });

            // Add to the relationship
            _self.issue.get('files').pushObject(upload);

        } catch (e) {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.file.uploadfailed"),
                type: 'error',
                showCloseButton: true
            });
            upload.rollback();
        }
    })).maxConcurrency(3).enqueue() handleUpload

    /**
     * This function saves the comment in the database
     *
     * @param issue
     * @param comment
     * @return {Promise}
     * @private
     */
    _createComment(issue, content) {
        Logger.debug('Prometheus.Controllers.App.Project.Issue.Page::_createComment');

        let _self = this;
        let comment = _self.store.createRecord('comment', {
            relatedId: issue.get('conversationRoomId'),
            relatedTo: 'conversationrooms',
            comment: content,
        });

        Logger.debug('-Prometheus.Controllers.App.Project.Issue.Page::_createComment');

        return comment.save().then(function (savedComment) {
            issue.get('comments').pushObject(savedComment);
            _self.pubSub.trigger('clearContents');
        });
    }

    /**
     * This function is used to validate the time log
     *
     * @param timeLog
     * @private
     */
    _validateLog(timeLog) {
        if (timeLog.get('days') === undefined) {
            timeLog.set('days', 0);
        }

        if (timeLog.get('hours') === undefined) {
            timeLog.set('hours', 0);
        }

        if (timeLog.get('minutes') === undefined) {
            timeLog.set('minutes', 0);
        }

        if (((timeLog.get('days') * 8) + (timeLog.get('hours') * 60) + timeLog.get('minutes')) === 0) {
            return false;
        } else if (timeLog.get('spentOn') === undefined || timeLog.get('spentOn') === '') {
            return false;
        }
        return true;
    }

    /**
     * This function is used to validate the time log
     *
     * @param timeLog
     * @private
     */
    _validateEstimate(timeLog) {
        if (timeLog.get('days') === undefined) {
            timeLog.set('days', 0);
        }

        if (timeLog.get('hours') === undefined) {
            timeLog.set('hours', 0);
        }

        if (timeLog.get('minutes') === undefined) {
            timeLog.set('minutes', 0);
        }

        if (((timeLog.get('days') * 8) + (timeLog.get('hours') * 60) + timeLog.get('minutes')) === 0) {
            return false;
        } else if (timeLog.get('description') == undefined) {
            return false;
        }

        return true;
    }

    /**
     * This action is used to navigate the user to the issue page
     *
     * @method editIssue
     * @param {Integer} issueNumber The issue number, which is used as an issue identifier
     * @public
     */
    @action editIssue(issueNumber) {
        Logger.debug('IssueIssueDetailsComponent::editIssue(' + issueNumber + ')');
        if(!this.args.quickView) {
            this.router.transitionTo('app.project.issue.edit', { issue_number: issueNumber });
        } else {
            let url = this.router.urlFor('app.project.issue.edit', { issue_number: issueNumber });
            window.open(url, '_blank');
        }
        Logger.debug('-IssueIssueDetailsComponent::paginate()');
    }

    /**
     * This event is called when it is required to upload a file
     * This function acts as a bridge event
     *
     * @param file
     */
    @action uploadFile(file) {
        Logger.debug("Uploading a file");
        this.handleUpload.perform(file);
    }

    /**
     * This function is used to handle the deletion of a file
     *
     * @param file
     */
    @action deleteFile(file) {
        Logger.debug('IssueIssueDetailsComponent->deleteFile');
        let _self = this;

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.issue.detail.file.delete", { name: file.get('name') })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.issue.detail.file.confirmdelete")).toString(),
                    action: function () {
                        // First remove from the relationship
                        _self.issue.get('files').removeObject(file);
                        
                        // Then destroy the record
                        file.destroyRecord().then(function () {
                            return deleting.update({
                                message: _self.intl.t("views.app.issue.detail.file.deleted"),
                                type: 'success',
                                actions: false
                            });
                        }).catch(() => {
                            // If destroy fails, add the file back to the relationship
                            _self.issue.get('files').pushObject(file);
                            deleting.update({
                                message: _self.intl.t("views.app.issue.detail.file.deletefailed"),
                                type: 'error',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: _self.intl.t("views.app.issue.detail.file.onsecondthought").toString(),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t("views.app.issue.detail.file.deletecancel"),
                            type: 'success',
                            actions: false
                        });
                    }
                }
            }
        });
    }

    /**
     * This function is used to handle the download of a file
     *
     * @param file
     */
    @action downloadFile(file) {
        Logger.debug('IssueIssueDetailsComponent->downloadFile');
        let _self = this;
        Logger.debug(_self);

        // get a download token
        let options = {
            id: file.get('id'),
            download: true
        };
        Logger.debug('Retrieving upload with options ' + options);
        this.store.query('upload', options).then(function (data) {
            let downloadLink = data.objectAt(0).get('downloadLink');
            Logger.debug('Download link found : ' + downloadLink);

            let path = _self.store.adapterFor('upload').host + '/download/get/' + downloadLink;
            window.open(path, '_blank');
            Logger.debug(path);

        });


        // navigate user to the page for download

        Logger.debug('-IssueIssueDetailsComponent->downloadFile');
    }

    /**
     * This function is used to handle the preview of a file
     *
     * @param file
     */
    @action previewFile(file) {
        Logger.debug('IssueIssueDetailsComponent->previewFile');
        let _self = this;
        Logger.debug(_self);
        _self.showDialog();

        // get a download token
        let options = {
            id: file.get('id'),
            download: true
        };
        Logger.debug('Retrieving upload with options ' + options);
        _self.store.query('upload', options).then(function (contents) {
            let downloadLink = contents.objectAt(0).get('downloadLink');
            Logger.debug('Download link found : ' + downloadLink);

            let path = _self.store.adapterFor('upload').host + '/preview/get/' + downloadLink;
            $('#file_preview').attr('src', path);
            Logger.debug(path);
        });


        // navigate user to the page for download

        Logger.debug('-IssueIssueDetailsComponent->previewFile');
    }

    /**
     * This function is used to log time against the issue
     *
     * @method logTime
     * @public
     */
    @action logTime() {
        Logger.debug('IssueIssueDetailsComponent->logTime');
        let _self = this;
        let newLog = _self.newTimeLog;

        Logger.debug(_self);
        Logger.debug(newLog);

        // Validate the time log and spentOn
        if (_self._validateLog(newLog)) {
            newLog.set('issueId', _self.issue.id);
            newLog.set('projectId', _self.issue.projectId);
            newLog.set('projectShortcode', _self.issue.projectShortcode);
            newLog.set('context', 'spent');

            newLog.save().then(function () {

                let timelog = _self.store.createRecord('timelog');
                _self.newTimeLog = timelog;
                _self.issue.get('spent').pushObject(newLog);
                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail.timelog.added"),
                    type: 'success',
                    showCloseButton: true
                });

            });
        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.timelog.missing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.removeLogTimeModal();

        Logger.debug('-IssueIssueDetailsComponent->logTime');
    }

    /**
     * This function is used to log time against the issue
     *
     * @method addEstimate
     * @public
     */
    @action addEstimate() {
        Logger.debug('Prometheus.App.Project.Issue.Page::addEstimate');
        let _self = this;
        let newLog = _self.newTimeLog;

        // Validate the time log and spentOn
        if (_self._validateEstimate(newLog)) {
            newLog.set('issueId', _self.issue.id);
            newLog.set('projectId', _self.issue.projectId);
            newLog.set('projectShortcode', _self.issue.projectShortcode);
            newLog.set('context', 'est');

            newLog.save().then(function () {

                let timelog = _self.store.createRecord('timelog');
                _self.newTimeLog = timelog;
                _self.issue.estimated.pushObject(newLog);

                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail.timelog.estimated"),
                    type: 'success',
                    showCloseButton: true
                });

            });

        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.timelog.estmissing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.removeEstimateTimeModal();
        Logger.debug('-Prometheus.App.Project.Issue.Pagw::addEstimate');
    }


    /**
     * This function is used to delete logged or estimated time
     *
     * @method deleteLog
     * @public
     */
    @action deleteLog(log) {
        Logger.debug('Prometheus.Controllers.App.Project.Issue.Create::deleteLog');
        let _self = this;
        let intl = _self.intl;

        let message = new Messenger().post({
            message: intl.t("global.form.deletecicked").toString(),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: intl.t("global.form.confirmcancel").toString(),
                    action: function () {
                        log.deleteRecord();
                        log.save().then(function () {
                            message.cancel();
                            new Messenger().post({
                                message: intl.t("global.form.deleted"),
                                type: 'success',
                                showCloseButton: true
                            });
                        });
                    }
                },
                cancel: {
                    label: intl.t("global.form.onsecondthought").toString(),
                    action: function () {
                        message.cancel();
                    }
                },

            }
        });
        Logger.debug('-Prometheus.Controllers.App.Project.Issue.Create::deleteLog');
    }

    /**
     * This function is used to edit the logged time
     * against the issue
     *
     * @method editLog
     * @public
     */
    @action editLog() {
        Logger.debug('IssueIssueDetailsComponent->editLog');
        let _self = this;
        Logger.debug(_self);
        let log = _self.editingLog;
        let context = log.get('context');

        let isValid = false;
        if (context === "est") {
            isValid = _self._validateEstimate(log);
        } else {
            isValid = _self._validateLog(log);
        }

        // Validate the time log and spentOn
        if (isValid) {
            log.save().then(function () {

                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail." + context + ".edited"),
                    type: 'success',
                    showCloseButton: true
                });
                _self.reload();

            });
        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail." + context + ".missing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.editingLog = null;
        _self.removeEditLogModal();
        _self.removeEditEstimateModal();

        Logger.debug('-IssueIssueDetailsComponent->logTime');
    }

    /**
     * This action is used to save a comment for a given issue. If the issue does not have an associated
     * conversation room, a new conversation room is created first. Once the conversation room is available,
     * the comment is created and saved.
     *
     * @method saveComment
     * @param {Prometheus.Models.Issue} issue - The issue object for which the comment is being saved.
     * @param {Prometheus.Models.Comment} comment - The content of the comment to be saved.
     * @return {Promise} - A promise that resolves when the comment is successfully saved.
     * @public
     */    
    @action saveComment(issue, comment) {
        Logger.debug('Prometheus.Controller.App.Project.Issue.Page::saveComment');

        if (comment == undefined) {
            return false;
        }

        let _self = this;
        Logger.debug(issue);
        Logger.debug(comment);
        if (issue.get('conversationRoomId') == undefined) {
            let newConversation = _self.store.createRecord('conversationroom', {
                subject: 'Issue #' + issue.get('issueNumber'),
                description: issue.get('subject'),
                roomType: 'discussion',
                projectId: issue.get('projectId'),
                projectName: issue.get('project.name'),
                issueId: issue.get('id'),
                projectShortcode: issue.get('projectShortcode'),
                issueNumber: issue.get('issueNumber')
            });
            Logger.debug('-Prometheus.Controller.App.Project.Issue.Page::saveComment');
            return newConversation.save().then(function (conversation) {
                issue.set('conversationRoomId', conversation.get('id'))
               return _self._createComment(issue, comment);
            });
        } else {
            Logger.debug('-Prometheus.Controller.App.Project.Issue.Page::saveComment');
            return _self._createComment(issue, comment);
        }
    }

    /**
     * This function navigates a user to the parent issue
     *
     * @param issueNumber
     * @param projectId
     */
    @action navigateToIssue(issueNumber, projectId) {
        this.router.transitionTo('app.project.issue.page', {
            issue_number: issueNumber,
            shortcode: this.trackedProject.shortCode
        });
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showEditLogDialog
     * @public
     */
    @action showEditLogDialog(log) {
        this.editingLog = log;
        this.editLogDialog = true;
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showEditLogDialog
     * @public
     */
    @action showEditEstimateDialog(log) {
        this.editingLog = log;
        this.editEstimateDialog = true;
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showLogTimeDialog
     * @public
     */
    @action showLogTimeDialog() {
        this.logTimeDialog = true;
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showLogTimeDialog
     * @public
     */
    @action showEstimateTimeDialog() {
        this.estimateTimeDialog = true;
    }
    /**
     * This function is used to show the add modal dialog box
     *
     * @method showDialog
     * @public
     */
    @action showDialog() {
        this.filePreviewDialog = true;
    }

    /**
     * This function is used to hide the add tag modal
     *
     * @method removeModal
     * @public
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.filePreviewDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the log time modal
     *
     * @method removeLogTimeModal
     * @public
     */
    @action removeLogTimeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.logTimeDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the log time modal
     *
     * @method removeLogTimeModal
     * @public
     */
    @action removeEstimateTimeModal() {
        if (this.isDestroyed || this.isDestroying) return;        
        this.estimateTimeDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the edit log time modal
     *
     * @method removeEditLogModal
     * @public
     */
    @action removeEditLogModal() {
        if (this.isDestroyed || this.isDestroying) return;        
        this.editingLog = null;
        this.editLogDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the edit log time modal
     *
     * @method removeEditLogModal
     * @public
     */
    @action removeEditEstimateModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.editingLog = null;
        this.editEstimateDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This function is used to update the timelog.
     *
     * @method updateTimelog
     * @param {Prometheus.Models.Timelog} timelog - The timelog object to be updated
     * @param {String} field - The field to be updated
     * @param {String} value - The value to be updated
     * @public
     */
    @action updateTimelog(timelog, field, value) {
        timelog[field] = value;
    }

    /**
     * This action is used to scroll to the comment.
     *
     * @method scrollToComment
     * @public
     */
    @action scrollToElement(element, type) {
        let selectors = {
            'comment': `[data-comment-id="${this.args.s_id}"]`,
            'estimate': `[data-issue-estimate-id="${this.args.s_id}"]`,
            'spent': `[data-issue-spent-id="${this.args.s_id}"]`,
            'conversation': `[data-conversation-id="${this.args.s_id}"]`
        }
        let el = element.querySelector(selectors[type]);
        if(el) {
            this.args.scrollAndHighlight(el, true);
        }
    }

    /**
     * Updates the status of an issue
     * 
     * @method updateStatus
     * @param {Prometheus.Models.Issue} issue The issue to update
     * @param {String} newStatus The new status to set
     * @public
     */
    @action updateStatus(issue, newStatus) {
        Logger.debug('IssueIssueDetailsComponent::updateStatus');
        let _self = this;
        let translatedStatus = _self.intl.t(`views.app.issue.lists.status.${newStatus}`);
        let messenger = new Messenger().post({
            message: _self.intl.t("views.app.issue.detail.statusUpdating", { status: translatedStatus }),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });
        issue.set('status', newStatus);
        let statusId = this.args.issueStatuses.findBy('name', newStatus).id;
        issue.set('statusId', statusId);
        issue.save().then(() => {
            messenger.update({
                message: _self.intl.t("views.app.issue.detail.statusUpdated", { status: translatedStatus }),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });
        }).catch(() => {
            messenger.update({
                message: _self.intl.t("views.app.issue.detail.statusUpdateFailed", { status: translatedStatus }),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
            issue.rollbackAttributes();
        });
    }

    /**
     * This action sets the `issuePlanDialog` flag to true, which is typically used to show
     * the modal in the template. It then calls {@link fetchIssuePlan} to retrieve the plan
     * data for the current issue from the backend.
     *
     * @method showIssuePlanDialog
     * @public
     */
    @action showIssuePlanDialog() {
        this.issuePlanDialog = true;
        this.fetchIssuePlan();
    }

    /**
     * This action toggles the watching status of the current issue.
     * If the issue is not being watched, it enables watching and shows a success message.
     * If the issue is being watched, it disables watching and shows a success message.
     *
     * @method toggleWatcher
     * @public
     */
    @action toggleWatcher() {
        Logger.debug('IssueIssueDetailsComponent::toggleWatcher');
        let _self = this;
        
        if(this.isCoreMember) {
            new Messenger().post({
                message: this.intl.t('views.app.issue.watcher.cannotAddCoreMember'),
                type: 'error',
                showCloseButton: true
            });
            return;
        }        

        let watcher = this.issue.watchers.find(watcher => watcher.userId === this.currentUser.user.id);
        if(watcher) {
            watcher.isWatching = !watcher.isWatching;
        } else {
            watcher = this.store.createRecord('issuewatcher', {
                issueId: this.issue.id,
                userId: this.currentUser.user.id,
                isWatching: true
            });

            this.issue.watchers.pushObject(watcher);
        }
        watcher.save().then(() => {
            let messageKey = watcher.isWatching ? 'views.app.issue.watcher.enabled' : 'views.app.issue.watcher.disabled';
            new Messenger().post({
                message: _self.intl.t(messageKey),
                type: 'success',
                showCloseButton: true
            });
        }).catch(() => {
            watcher.isWatching = !watcher.isWatching;
            new Messenger().post({
                message: _self.intl.t('global.oops'),
                type: 'error',
                showCloseButton: true
            });
        });
        
        Logger.debug('-IssueIssueDetailsComponent::toggleWatcher');
    }

    /**
     * This action toggles the add watcher dialog visibility.
     *
     * @method toggleAddWatcherDialog
     * @public
     */
    @action removeAddWatcherDialog() {
        if (this.isDestroyed || this.isDestroying) return;
        this.addWatcherDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This action shows the add watcher dialog.
     *
     * @method showAddWatcherDialog
     * @public
     */
    @action showAddWatcherDialog() {
        this.addWatcherDialog = true;
    }

    /**
     * This action adds a project member as a watcher to the current issue.
     * For now, this method is a placeholder for the next iteration.
     *
     * @method addWatcher
     * @param {Object} member The project member to add as a watcher
     * @public
     */
    @action
    async addWatcher(member) {
        Logger.debug('IssueIssueDetailsComponent::addWatcher - Member:', member.name);
        try {
            let existingWatcher = this.issue.watchers.find(watcher => watcher.userId === member.id);
            if(existingWatcher) {
                existingWatcher.isWatching = true;
                await existingWatcher.save();
                new Messenger().post({
                    message: htmlSafe(this.intl.t('views.app.issue.watcher.added', { name: member.name })),
                    type: 'success',
                    showCloseButton: true
                });
                return;
            }

            let watcher = this.store.createRecord('issuewatcher', {
                issueId: this.issue.id,
                userId: member.id,
                isWatching: true
            });
            await watcher.save();
            this.issue.watchers.pushObject(watcher);
            new Messenger().post({
                message: htmlSafe(this.intl.t('views.app.issue.watcher.added', { name: member.name })),
                type: 'success',
                showCloseButton: true
            });
        } catch (e) {
            Logger.error('IssueIssueDetailsComponent::addWatcher - Error:', e);
        }
        Logger.debug('-IssueIssueDetailsComponent::addWatcher');
    }

    /**
     * This method sets the `issuePlanDialog` flag to false, clears any loaded plan data
     * and errors, and programmatically hides any open modal dialogs using jQuery.
     *
     * @method removeIssuePlanDialog
     * @public
     */
    @action removeIssuePlanDialog() {
        // Before closing, cancel the xhr request of issue planning
        this.issuePlanningAbortController.abort('AbortError');
        this.issuePlanningAbortController = new AbortController();
        this.issuePlanDialog = false;
        this.issuePlanData = null;
        this.issuePlanError = null;
        $('.modal').modal('hide');
    }

    /**
     * This asynchronous action sends a POST request to the `/issueplanning` API endpoint,
     * passing the current issue's number. It manages loading and error state, and parses
     * the returned plan data if the request is successful. If the request fails or the
     * backend returns an error, it sets an appropriate error message.
     *
     * @method fetchIssuePlan
     * @async
     * @public
     * @returns {Promise<void>}
     */
    @action async fetchIssuePlan() {
        this.issuePlanLoading = true;
        this.issuePlanError = null;
        this.issuePlanData = null;
        let _self = this;
        try {
            let url = `${_self.apiHost}/api/v${_self.config.api.version}/issueplanning`;
            let requestBody = {
                issueNumber: this.issue.issueNumber
            };
            let response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${_self.session.data.authenticated.access_token}`
                },
                signal: this.issuePlanningAbortController.signal
            }).catch((error) => {
                if(error === 'AbortError') {
                    return;
                }
            });
            if (response?.ok) {
                let data = await response.json();
                if (data.success && data.data) {
                    this.issuePlanData = JSON.parse(data.data);
                } else {
                    this.issuePlanError = data.message || 'AI planning failed.';
                }
            } else {
                this.issuePlanError = this.intl.t('global.oops');
            }
        } catch (e) {
            Logger.error('IssueIssueDetailsComponent::fetchIssuePlan - Error:', e);
            this.issuePlanError = this.intl.t('global.oops');
        } finally {
            this.issuePlanLoading = false;
        }
    }
    
    /**
     * This computed property attempts to retrieve the project using the project ID
     * from the `projectController`. If the project is not found, it logs an error.
     *
     * @property project
     * @type {DS.Model|undefined}
     * @public
     */
    get project() {
        let project = this.store.peekRecord(
			'project',
			this.projectController.projectId
		);
        if (!project) {
            console.error('Project not found');
        }
        return project;
    }

    get isWatching() {
        return this.issue.watchers.find(watcher => watcher.userId === this.currentUser.user.id)?.isWatching || false;
    }

    /**
     * Computed property to determine if the current user is a core member of the issue.
     * Core members are assignee, owner, modifiedBy, or reportedBy.
     *
     * @property isCoreMember
     * @type {Boolean}
     * @public
     */
    get isCoreMember() {
        const currentUserId = this.currentUser.user.id;
        return (
            this.issue.assignee === currentUserId ||
            this.issue.owner=== currentUserId ||
            this.issue.modifiedUser === currentUserId ||
            this.issue.reportedUser === currentUserId
        );
    }

    /**
     * Computed property to get available project members who can be added as watchers.
     * Excludes current user, core issue members, and users who are actively watching the issue (isWatching: true).
     *
     * @property availableProjectMembers
     * @type {Array}
     * @public
     */
    get availableProjectMembers() {
        if (!this.projectController.members) {
            return [];
        }

        const currentUserId = this.currentUser.user.id;
        const activeWatcherIds = this.issue.watchers
            .filter(watcher => watcher.isWatching === true)
            .map(watcher => watcher.userId);
        
        // Core issue members who shouldn't be added as watchers
        const coreMemberIds = [
            this.issue.assignee,
            this.issue.owner,
            this.issue.modifiedUser,
            this.issue.reportedUser
        ].filter(id => id); // Filter out undefined/null values

        return this.projectController.members.filter(member => 
            member.get('id') !== currentUserId && 
            !activeWatcherIds.includes(member.get('id')) &&
            !coreMemberIds.includes(member.get('id'))
        );
    }

    /**
     * Property to get available project members who can be assigned to the issue.
     * Excludes the current assignee.
     *
     * @property availableAssignees
     * @type {Array}
     * @public
     */
    get availableAssignees() {
        if (!this.projectController.model.members) {
            return [];
        }

        return this.projectController.model.members.filter(member => 
            member.get('id') !== this.issue.assignedTo?.get('id')
        );
    }

    /**
     * Updates the assignee of an issue
     * 
     * @method updateAssignee
     * @param {Prometheus.Models.Issue} issue The issue to update
     * @param {Prometheus.Models.User} newAssignee The new assignee to set
     * @public
     */
    @action updateAssignee(issue, newAssignee) {
        Logger.debug('AppProjectIssuePageController::updateAssignee');
        let _self = this;
        let messenger = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.issue.detail.assigneeUpdating", { name: newAssignee.name })),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });
        
        issue.assignedTo = newAssignee;
        issue.assignee = newAssignee.id;
        
        issue.save().then(() => {
            messenger.update({
                message: htmlSafe(_self.intl.t("views.app.issue.detail.assigneeUpdated", { name: newAssignee.name })),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });
            this.postUpdateAssignee(issue);
        }).catch(() => {
            messenger.update({
                message: htmlSafe(_self.intl.t("views.app.issue.detail.assigneeUpdateFailed", { name: newAssignee.name })),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
            issue.rollbackAttributes();
            this.postUpdateAssignee(issue);
        });
    }    


    /**
     * This function is called after the assignee is updated.
     *
     * @method postUpdateAssignee
     * @param {Object} issue Issue Model
     * @public
     */
    postUpdateAssignee(issue) {
        if(this.args.postUpdateAssignee) {
            this.args.postUpdateAssignee(issue);
        }
    }

    /**
     * This function loads the search data
     *
     * @param query
     * @return {RSVP.Promise|Test.Promise|*}
     */
    loadSearchData(query) {
        let _self = this;
        let projectId = this.trackedProject.getProjectId();
        let options = {
            fields: 'Issue.id,Issue.issueNumber,Issue.subject,Issue.status,Issue.priority,Issue.projectId',
            query: '((Issue.issueNumber CONTAINS ' + query +') AND (Issue.projectId : '+ projectId +'))',
            limit: 5,
            sort:'Issue.issueNumber',
            order: 'DESC'
        };
        return new RSVP.Promise((resolve) => {
            resolve(_self.store.query('issue', options));
        });
    }

    /**
     * This is the task that is used to perform the search.
     *
     * @property search
     * @type task
     * @public
     */
    @task(function* (query) {
       yield timeout(500);
       return this.loadSearchData(query);
    }) search
}
