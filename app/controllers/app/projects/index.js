import _ from "lodash";
import queryBuilder from "../../../utils/query/builder";
import queryParser from "../../../utils/query/parser";
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import $ from 'jquery';

/**
 * This is empty controller, normally we do not create them. However
 * Ember's inject in the child controllers was failing on reload
 * when this controller did not exist. Apparently Ember.inject.controller
 * does not work on run time generated controllers in case of page reload
 *
 * @class Index
 * @namespace Prometheus.Controller.Projects
 * @module App
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend({

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
    sort: 'Project.dateModified',

    /**
     * This property stores the current query based on which the page is filtered.
     *
     * @property query
     * @type String
     * @for Issue
     * @private
     */
    query: null,

    /**
     * The count of the selected items in the list view.
     *
     * @property selectedCount
     * @for Issue
     * @type Integer
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
    i18n : inject(),

    /**
     * The current user service
     *
     * @property currentUser
     * @type Prometheus.Services.currentUser
     * @for Index
     * @public
     */
    currentUser : inject(),

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
        paginate:function(page){
            Logger.debug('Prometheus.Controllers.Projects.Index::paginate('+page+')');
            this.send('selectAll',false);
            this.set('page',page);
            Logger.debug('-Prometheus.Controllers.Projects.Index::paginate()');
        },

        /**
         * This action filters the data
         *
         * @method filter
         * @public
         */
        filter:function(){
            Logger.debug('Prometheus.Controllers.Projects.Index::filter()');
            Logger.debug('-Prometheus.Controllers.Projects.Index::filter()');
        },

        /**
         * This action is used to sort the data
         *
         * @method sortData
         * @param field {String} The field that the user wishes to sort the data on
         * @public
         */
        sortData:function(field){
            Logger.debug('Prometheus.Controllers.Projects.Index::sortData('+field+')');

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
            Logger.debug('-Prometheus.Controllers.Projects.Index::sortData()');
        },


        /**
         * This action is used to reload the page, whether it be with changes in the
         * parameters or without any change
         *
         * @method reloadPage
         * @public
         * @todo Hack Alert!!
         */
        reloadPage:function(){
            Logger.debug('Prometheus.Controllers.Projects.Index::reloadPage()');
            // Hack Alert!!!
            this.set('query',this.get('query')+' ');
            Logger.debug('-Prometheus.Controllers.Projects.Index::reloadPage()');
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
        populateQuery:function(query){
            this.queryString = query;
        },

        /**
         * Convert the rul object to string and perform searched
         *
         * @method searchByRules
         * @return void
         * @public
         */
        searchByRules:function(){
            var result = queryBuilder.getRules();
            if (!$.isEmptyObject(result)) {
                var query = queryParser.getQueryString(result);
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
        openFilters:function(){
            $('.search [data-toggle=collapse]').click();
            $('.search input').blur();
        },

        /**
         * Toggle the dropdown arrow on toggle
         *
         * @method toggleFilters
         * @private
         */
        toggleFilters:function(){
            $('#toggleFilters').toggleClass('dropToggle');
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
        selectAll:function(value){
            // Select all the checkboxes in the list view
            _.each($('.list-view input[type=checkbox]').not('[data-select=all]'),function(element) {
                element.checked = value;
            });

            _.each($('.list-view [data-select=all]'),function(element) {
                element.checked = value;
            });


            this.set('selectedCount',$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);
        },

        /**
         * This function is triggerd when an item in the list is selected
         *
         * @method select
         * @param value {Boolean} whether the checkbox was selected of not
         * @return void
         * @todo allow the retention of the checkboxes across the multiple pages
         * @todo convert to a component
         *@public
         */
        select:function(value){
            // Select/Deslect one checkboxes in the list view
            this.set('selectedCount',$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);

            // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
            if (!value) {
                var selectAll = $('[data-select=all]').prop('checked');
                if (selectAll){
                    $('[data-select=all]').prop('checked',false);
                }
            }
            // If all the items in the list were selected then check the select all checkbox as well
            else {
                // if checked boxes are equal to total boxes then enable check all box
                if ($('.list-view input[type=checkbox]:checked').not('[data-select=all]').length === $('.list-view input[type=checkbox]').not('[data-select=all]').length) {
                    $('[data-select=all]').prop('checked',true);
                }}
        },

        /**
         * This function is used to navigate the user to the detail page
         * for the project
         *
         * @method openDetail
         * @param {Prometheus.Model.Project} project the project model to which we have to navigate to
         * @public
         */
        openDetail:function(project){
            Logger.debug("Prometheus.Controllers.Projects.Index::openDetail");
            this.transitionToRoute('app.project.index',{project_id:project.get('id')});
            Logger.debug("-Prometheus.Controllers.Projects.Index::openDetail");
        },

        /**
         * This function is used to help navigate to the create project page
         *
         * @method createProject
         * @public
         */
        createProject:function(){
            Logger.debug("Prometheus.Controllers.Projects.Index::createProject()");
            this.transitionToRoute('app.projects.create');
            Logger.debug("-Prometheus.Controllers.Projects.Index::createProject()");
        },

        /**
         * This function is used to save a search
         *
         * @method saveSearch
         * @public
         */
        saveSearch () {
            Logger.debug('Prometheus.Controllers.Projects.Index->openSaveSearch');
            let _self = this;
            _self.send('searchByRules');
            let query = _self.get('query');

            if (query !== null) {
                let _savedSearch = _self.get('newSavedsearch');
                _savedSearch.set('dateCreated','CURRENT_DATETIME');
                _savedSearch.set('createdUser',_self.get('currentUser.user.id'));
                _savedSearch.set('createdUserName',_self.get('currentUser.user.name'));
                _savedSearch.set('relatedTo','project');
                _savedSearch.set('searchquery',query);

                _savedSearch.save().then(function (data) {
                    _self.get('savedsearches').pushObject(data);
                    _self.set('newSavedsearch',{});

                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.project.list.savedsearch.added",{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });

                });
            } else  {

                new Messenger().post({
                    message: _self.get('i18n').t("views.app.project.list.savedsearch.missing"),
                    type: 'error',
                    showCloseButton: true
                });

            }

            _self.send('removeSaveSearchDialog');

            Logger.debug('-Prometheus.Controllers.Projects.Index->openSaveSearch');
        },

        /**
         * This function is used to copy a public saved search
         *
         * @method copySearch
         * @public
         */
        copySearch (search) {
            Logger.debug('Prometheus.Controllers.Projects.Index->copySearch');
            let _self = this;

            let _savedSearch = _self.get('newSavedsearch');
            _savedSearch.set('dateCreated','CURRENT_DATETIME');
            _savedSearch.set('createdUser',_self.get('currentUser.user.id'));
            _savedSearch.set('createdUserName',_self.get('currentUser.user.name'));
            _savedSearch.set('relatedTo','project');
            _savedSearch.set('searchquery',search.get('searchquery'));
            _savedSearch.set('name',search.get('name'));
            _savedSearch.set('public',0);

            _savedSearch.save().then(function (data) {
                _self.get('savedsearches').pushObject(data);
                let newSavedSearch = _self.get('store').createRecord('savedsearch');
                _self.set('newSavedsearch',newSavedSearch);

                new Messenger().post({
                    message: _self.get('i18n').t("views.app.project.list.savedsearch.copied",{name:data.get('name')}),
                    type: 'success',
                    showCloseButton: true
                });

            });

            Logger.debug('-Prometheus.Controllers.Projects.Index->copySearch');
        },

        /**
         * This function is used to delete a saved search
         *
         * @method deleteSearch
         * @public
         */
        deleteSearch(search) {
            Logger.debug('Prometheus.Controllers.Projects.Index->deleteSearch');
            let _self = this;
            let toBeDeleted = _self.get('savedsearches').findBy('id',search.get('id'));

            let deleting = new Messenger().post({
                message: _self.get('i18n').t("views.app.project.list.savedsearch.delete",{name:search.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: _self.get('i18n').t("views.app.project.list.savedsearch.confirmdelete").toString(),
                        action: function() {

                            // destroy the saved search
                            toBeDeleted.destroyRecord().then(function(){
                                // remove from the view by updating the model
                                _self.get('savedsearches').removeObject(toBeDeleted);

                                return deleting.update({
                                    message: _self.get('i18n').t("views.app.project.list.savedsearch.deleted",{name:search.get('name')}),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: _self.get('i18n').t("views.app.project.list.savedsearch.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: _self.get('i18n').t("views.app.project.list.savedsearch.deletecancel"),
                                type: 'success',
                                actions: false
                            });
                        }
                    },

                }
            });

            Logger.debug('-Prometheus.Controllers.Projects.Index->deleteSearch');
        },

        /**
         * This function is used to apply the saved searches
         *
         * @method applySearch
         * @param {Prometheus.Models.Savedsearch} search
         * @public
         */
        applySearch(search) {
            Logger.debug('Prometheus.Controllers.Projects.Index::applySearch');
            Logger.debug(search);

            this.set('query',search.get('searchquery'));
            Logger.debug('-Prometheus.Controllers.Projects.Index::applySearch');
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
