/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import _ from "lodash";
import queryBuilder from "prometheus/utils/query/builder";
import queryParser from "prometheus/utils/query/parser";

/**
 * This controller is used to provide the interaction between the template and
 * the route. The basic features that this controller provide are pagination,
 * sorting and filtering the data.
 *
 * @class Issue
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({

    /**
     * Query params that the controller needs to support, it may seem that the
     * same parameters are defined in both the route and the controller but is not
     * the case exactly, the parameters defined in the route are meant for the model
     * while the parameters defined in the controller are meant for the interaction
     * with the view. e.g. the query might be different because the user might be
     * composing it as compared to te query string that was last used to fetch the
     * data.
     *
     * @property queryParams
     * @for Issue
     * @type Array
     * @private
     */
    queryParams: ['sort','order','page','query'],

    /**
     * This property stores the current sorting order of the page, storing it here
     * allows us to toggle it.
     *
     * @property order
     * @type String
     * @for Issue
     * @private
     */
    order: 'desc',

    /**
     * This property stores the current page that the user is viewing,
     *
     * @property page
     * @type Integer
     * @for Issue
     * @private
     */
    page: 1,

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
     * This property stores the current query based on which the page is filtered.
     *
     * @property query
     * @type String
     * @for Issue
     * @private
     */
    query: '',

    /**
     * The count of the selected items in the list view.
     *
     * @property selectedCount
     * @type Integer
     * @for Issue
     * @private
     */
    selectedCount: 0,

    /**
     * This is the flag which is used to the display of the saved
     * search dialog
     *
     * @property saveSearchDialog
     * @for Index
     * @type boolean
     * @public
     */
    saveSearchDialog: false,

    /**
     * The empty saved search object that we utilize for saving searches
     *
     * @property savedsearch
     * @for Index
     * @type Prometheus.Models.Savedsearch
     * @public
     */
    savedsearch:null,

    /**
     * The internationalization service
     *
     * @property i18n
     * @type Ember.Services.i18n
     * @for Index
     * @public
     */
    i18n : Ember.inject.service(),

    /**
     * The current user service
     *
     * @property currentUser
     * @type Prometheus.Services.currentUser
     * @for Index
     * @public
     */
    currentUser : Ember.inject.service(),

    /**
     * The project controller
     *
     * @property appProjectController
     * @type Prometheus.Controllers.App.Project
     * @for Index
     * @public
     */
    appProjectController : Ember.inject.controller('app.project'),

    /**
     * The project controller
     *
     * @property appProjectController
     * @type Prometheus.Controllers.App.Project
     * @for Index
     * @public
     */
    projectId : Ember.computed(function () {
        return this.get('appProjectController.projectId');
    }).property('appProjectController.projectId'),

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
         * This action allows us to more from one page to the other
         *
         * @method paginate
         * @param {Integer} page The page that the user wishes to see
         * @public
         */
        paginate(page){
            Logger.debug('AppProjectIssueController::paginate('+page+')');
            this.set('page',page);
            Logger.debug('-AppProjectIssueController::paginate()');
        },

        /**
         * This action filters the data
         *
         * @method filter
         * @public
         */
        filter(){
            Logger.debug('AppProjectIssueController::filter()');
            Logger.debug('-AppProjectIssueController::filter()');
        },

        /**
         * This action is used to sort the data
         *
         * @method sortData
         * @param field {String} The field that the user wishes to sort the data on
         * @public
         */
        sortData(field){
            Logger.debug('AppProjectIssueController::sortData('+field+')');

            // If the current field is being sorted then toggle it
            if (field === this.get('sort')) {
                if (this.get('order') === 'desc') {
                    this.set('order','asc');
                } else {
                    this.set('order','desc');
                }
            }
            // Otherwise start with the default value
            else {
                this.set('order','desc');
            }

            // Set the field that is being sorted, if it is changed then the model
            // update will be triggered by Ember
            this.set('sort',field);
            Logger.debug('-AppProjectIssueController::sortData()');
        },


        /**
         * This action is used to reload the page, whether it be with changes
         * in the parameters or without any change
         *
         * @method reloadPage
         * @public
         * @todo Hack Alert!!
         */
        reloadPage(){
            Logger.debug('AppProjectIssueController::reloadPage()');
            // Hack Alert!!!
            this.set('query',this.get('query')+' ');
            Logger.debug('-AppProjectIssueController::reloadPage()');
        },

        /**
         * Keep the query being searched in the controller
         *
         * @method populateQuery
         * @param {String} query
         * @return void
         * @public
         * @todo allow auto complete
         */
        populateQuery(query){
            this.queryString = query;
        },

        /**
         * Convert the rul object to string and perform searched
         *
         * @method searchByRules
         * @return void
         * @public
         */
        searchByRules(){
            let result = queryBuilder.getRules();
            if (!Ember.$.isEmptyObject(result)) {
                let query = queryParser.getQueryString(result);
                this.queryString = query;
                this.set('query', query);
            }
        },

        /**
         * Open the filter view if not already Open
         *
         * @method openFilters
         * @public
         */
        openFilters(){
            Ember.$('.search [data-toggle=collapse]').click();
            Ember.$('.search input').blur();
        },

        /**
         * Toggle the dropdown arrow on toggle
         *
         * @method toggleFilters
         * @private
         */
        toggleFilters(){
            Ember.$('#toggleFilters').toggleClass('dropToggle');
        },

        /**
         * This function is triggered when the checkbox on the the top right of the list is called
         * This function only selects the items currently visible in the list-view
         *
         * @method selectAll
         * @param {Boolean} value whether the selectAll checkbox was selected of not
         * @return void
         * @todo allow the retention of the checkboxes across the multiple pages
         * @public
         */
        selectAll(value){
            // Select all the checkboxes in the list view
            _.each(Ember.$('.list-view input[type=checkbox]').not('[data-select=all]'),function(element) {
                element.checked = value;
            });

            _.each(Ember.$('.list-view [data-select=all]'),function(element) {
                element.checked = value;
            });


            this.set('selectedCount',Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);
        },

        /**
         * This function is triggered when an item in the list is selected
         *
         * @method select
         * @param value {Boolean} whether the checkbox was selected of not
         * @return void
         * @todo allow the retention of the checkboxes across the multiple pages
         * @todo convert to a component
         *@public
         */
        select(value){
            // Select/Deselect one checkboxes in the list view
            this.set('selectedCount',Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);

            // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
            if (!value) {
                let selectAll = Ember.$('[data-select=all]').prop('checked');
                if (selectAll){
                    Ember.$('[data-select=all]').prop('checked',false);
                }
            }
            // If all the items in the list were selected then check the select all checkbox as well
            else {
                // if checked boxes are equal to total boxes then enable check all box
                if (Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length === Ember.$('.list-view input[type=checkbox]').not('[data-select=all]').length) {
                    Ember.$('[data-select=all]').prop('checked',true);
                }}
        },

        /**
         * This function is used to navigate the user to the detail page for the issues
         *
         * @method openDetail
         * @param {Prometheus.Models.Issue} issue the issue model to which we have to navigate to
         * @public
         */
        openDetail(issue){
            Logger.debug("AppProjectIssueController::openDetail");
            this.transitionToRoute('app.project.issue.page',{issueNumber:issue.get('issueNumber')});
            Logger.debug("-AppProjectIssueController::openDetail");
        },

        /**
         * This function is used to help navigate to the create issue page
         *
         * @method createIssue
         * @public
         */
        createIssue(){
            Logger.debug("AppProjectIssueController::createIssue");
            this.transitionToRoute('app.project.issue.create');
            Logger.debug("-AppProjectIssueController::createIssue");
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
                _savedSearch.set('dateCreated','CURRENT_DATETIME');
                _savedSearch.set('createdUser',_self.get('currentUser.user.id'));
                _savedSearch.set('createdUserName',_self.get('currentUser.user.name'));
                _savedSearch.set('relatedTo','issue');
                _savedSearch.set('searchquery',query);
                _savedSearch.set('projectId',_self.get('projectId'));

                _savedSearch.save().then(function (data) {
                    _self.get('savedsearches').pushObject(data);
                    _self.set('newSavedsearch',{});

                    new Messenger().post({
                        message: _self.get('i18n').t("view.app.issue.list.savedsearch.added",{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });

                });
            } else  {

                new Messenger().post({
                    message: _self.get('i18n').t("view.app.issue.list.savedsearch.missing"),
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
            _savedSearch.set('dateCreated','CURRENT_DATETIME');
            _savedSearch.set('createdUser',_self.get('currentUser.user.id'));
            _savedSearch.set('createdUserName',_self.get('currentUser.user.name'));
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
                    message: _self.get('i18n').t("view.app.issue.list.savedsearch.copied",{name:data.get('name')}),
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
                message: _self.get('i18n').t("view.app.issue.list.savedsearch.delete",{name:search.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: _self.get('i18n').t("view.app.issue.list.savedsearch.confirmdelete").toString(),
                        action: function() {

                            // destroy the saved search
                            toBeDeleted.destroyRecord().then(function(){
                                // remove from the view by updating the model
                                _self.get('savedsearches').removeObject(toBeDeleted);

                                return deleting.update({
                                    message: _self.get('i18n').t("view.app.issue.list.savedsearch.deleted",{name:search.get('name')}),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: _self.get('i18n').t("view.app.issue.list.savedsearch.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: _self.get('i18n').t("view.app.issue.list.savedsearch.deletecancel"),
                                type: 'success',
                                actions: false
                            });
                        }
                    },

                }
            });

            Logger.debug('-Prometheus.Controllers.Project.Issue->deleteSearch');
        },

        /**
         * This function is used to apply the saved searches
         *
         * @method applySearch
         * @param {Prometheus.Models.Savedsearch} search
         * @public
         */
        applySearch(search) {
            Logger.debug('Prometheus.Controllers.Project.Issue.Index::applySearch');
            Logger.debug(search);

            this.set('query',search.get('searchquery'));
            Logger.debug('-Prometheus.Controllers.Project.Issue.Index::applySearch');
        },

        /**
         * This function is used to display the dialog that allows user to save
         * their searches
         *
         * @method showSaveSearchDialog
         * @public
         */
        showSaveSearchDialog() {
            let _self = this;
            _self.send('searchByRules');
            _self.set('saveSearchDialog',true);
        },

        /**
         * This function is used to hide the dialog that allows user to save
         * their searches
         *
         * @method removeSaveSearchDialog
         * @public
         */
        removeSaveSearchDialog() {
            this.set('saveSearchDialog',false);
        }
    }

});