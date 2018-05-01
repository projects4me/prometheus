/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import List from "prometheus/controllers/prometheus/list";
import { computed } from '@ember/object';

/**
 * This controller is used to provide the interaction between the template and
 * the route. The basic features that this controller provide are pagination,
 * sorting and filtering the data.
 *
 * @class Issue
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends List
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default List.extend({

    /**
     * This property stores the field on which the page if currently sored on
     *
     * @property sort
     * @type String
     * @for Issue
     * @private
     */
    sort: 'Issue.issueNumber',

    /**
     * The action handlers for the issue list view
     *
     * @property action
     * @for Issue
     * @type Object
     * @public
     */
    actions:{

        /**
         * This function is used to navigate the user to the detail page for the issues
         *
         * @method openDetail
         * @param {Prometheus.Models.Issue} issue the issue model to which we have to navigate to
         * @public
         */
        openDetail(issue){
            Logger.debug("AppProjectIssueController::openDetail");
            this.transitionToRoute('app.project.issue.page',{issue_number:issue.get('issueNumber')});
            Logger.debug("-AppProjectIssueController::openDetail");
        },

        /**
         * This function is used to save a search
         *
         * @method saveSearch
         * @public
         */
        saveSearch () {
            Logger.debug('Prometheus.Controllers.Project.Issue->openSaveSearch');
            let _self = this;
            _self.send('searchByRules');
            let query = _self.get('query');
            Logger.debug(_self);

            if (query !== null) {
                let _savedSearch = _self.get('newSavedsearch');
                _savedSearch.set('relatedTo','issue');
                _savedSearch.set('searchquery',query);
                _savedSearch.set('projectId',_self.get('projectId'));

                _savedSearch.save().then(function (data) {
                    _self.get('savedsearches').pushObject(data);
                    _self.set('newSavedsearch',{});

                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.issue.list.savedsearch.added",{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });

                });
            } else  {

                new Messenger().post({
                    message: _self.get('i18n').t("views.app.issue.list.savedsearch.missing"),
                    type: 'error',
                    showCloseButton: true
                });

            }

            _self.send('removeSaveSearchDialog');

            Logger.debug('-Prometheus.Controllers.Project.Issue->openSaveSearch');
        },

        /**
         * This function is used to copy a public saved search
         *
         * @method copySearch
         * @public
         */
        copySearch (search) {
            Logger.debug('Prometheus.Controllers.Project.Issue->copySearch');
            let _self = this;
            Logger.debug(search);

            let _savedSearch = _self.get('newSavedsearch');
            _savedSearch.set('relatedTo','issue');
            _savedSearch.set('searchquery',search.get('searchquery'));
            _savedSearch.set('projectId',_self.get('projectId'));
            _savedSearch.set('name',search.get('name'));
            _savedSearch.set('public',0);

            _savedSearch.save().then(function (data) {
                _self.get('savedsearches').pushObject(data);
                let newSavedSearch = _self.get('store').createRecord('savedsearch');
                _self.set('newSavedsearch',newSavedSearch);

                new Messenger().post({
                    message: _self.get('i18n').t("views.app.issue.list.savedsearch.copied",{name:data.get('name')}),
                    type: 'success',
                    showCloseButton: true
                });

            });

            Logger.debug('-Prometheus.Controllers.Project.Issue->copySearch');
        },

        /**
         * This function is used to delete a saved search
         *
         * @method deleteSearch
         * @public
         */
        deleteSearch(search) {
            Logger.debug('Prometheus.Controllers.Project.Issue->deleteSearch');
            let _self = this;
            let toBeDeleted = _self.get('savedsearches').findBy('id',search.get('id'));

            let deleting = new Messenger().post({
                message: _self.get('i18n').t("views.app.issue.list.savedsearch.delete",{name:search.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: _self.get('i18n').t("views.app.issue.list.savedsearch.confirmdelete").toString(),
                        action: function() {

                            // destroy the saved search
                            toBeDeleted.destroyRecord().then(function(){
                                // remove from the view by updating the model
                                _self.get('savedsearches').removeObject(toBeDeleted);

                                return deleting.update({
                                    message: _self.get('i18n').t("views.app.issue.list.savedsearch.deleted",{name:search.get('name')}),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: _self.get('i18n').t("views.app.issue.list.savedsearch.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: _self.get('i18n').t("views.app.issue.list.savedsearch.deletecancel"),
                                type: 'success',
                                actions: false
                            });
                        }
                    },

                }
            });

            Logger.debug('-Prometheus.Controllers.Project.Issue->deleteSearch');
        },

    }

});