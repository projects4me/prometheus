/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import _ from "lodash";
import queryBuilder from "prometheus/utils/query/builder";
import queryParser from "prometheus/utils/query/parser";
import $ from 'jquery';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'prometheus/config/environment';
import { htmlSafe } from '@ember/template';
import { scheduleOnce } from '@ember/runloop';

/**
 * This controller provides the base
 *
 * @class List
 * @namespace Prometheus.Controllers
 * @module Prometheus
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class PrometheusListController extends PrometheusController {

    /**
     * The default list view supports the following parameters that can
     * trigger a change in the data displayed on the page
     *
     *  * sort
     *  * order
     *  * page
     *  * query
     *
     * @property queryParams
     * @for List
     * @type Array
     * @private
     */
    queryParams = ['sort', 'order', 'page', 'query'];

    /**
     * This property stores the current sorting order of the page,
     *
     * @property order
     * @for List
     * @type String
     * @private
     */
    order = 'desc';

    /**
     * This property stores the current page that the user is viewing,
     *
     * @property page
     * @for List
     * @type Integer
     * @private
     */
    @tracked page = 1;

    /**
     * This property stores the field on which the page if currently sored on
     *
     * @property sort
     * @for List
     * @type String
     * @private
     */
    sort = '';

    /**
     * This property stores the current query based on which the page is filtered.
     *
     * @property query
     * @for List
     * @type String
     * @private
     */
    query = '';

    /**
     * The count of the selected items in the list view.
     *
     * @property selectedCount
     * @type Integer
     * @for List
     * @private
     */
    @tracked selectedCount = 0;

    /**
     * This is the flag which is used to the display of the saved
     * search dialog
     *
     * @property saveSearchDialog
     * @for List
     * @type boolean
     * @public
     */
    saveSearchDialog = false;

    /**
     * This is the flag which is used to the display the export data dialog.
     * 
     * @property exportDialog
     * @for List
     * @type boolean
     * @public
     */
    @tracked exportDialog = false;

    /**
     * This is the flag which is used to the display the mass update dialog.
     * 
     * @property massUpdateDialog
     * @for List
     * @type boolean
     * @public
     */
    @tracked massUpdateDialog = false;

    /**
     * This property stores the mass update model.
     * 
     * @property massUpdateModel
     * @for List
     * @type Prometheus.Models
     * @public
     */
    @tracked massUpdateModel = null;
    /**
     * The keydown event handler function for search queries
     * 
     * @property _searchRulesHandler
     * @for List
     * @type Function
     * @private
     */
    _searchRulesHandler = null;

    /**
     * The empty saved search object that we utilize for saving searches
     *
     * @property savedsearch
     * @for List
     * @type Prometheus.Models.Savedsearch
     * @public
     */
    savedsearch = null;

    /**
     * This property stores the ids of the selected items in the list view.
     * Organized by page number, where each key is a page number and the value
     * is an array of selected IDs for that page.
     *
     * @property selectedIds
     * @for List
     * @type Object
     * @public
     */
    @tracked selectedIds = {};

    /**
     * Selected relationships will be exported along with the model data.
     * 
     * @property exportRelationships
     * @for List
     * @type Array
     * @public
     */
    @tracked exportRelationships = [];

    /**
     * This property tracks whether all items are selected or not.
     *
     * @property isAllSelected
     * @for List
     * @type Boolean
     * @private
     */
    @tracked isAllSelected = false;

    /**
     * The project controller
     *
     * @property appProjectController
     * @for List
     * @type Prometheus.Controllers.App.Project
     * @public
     */
    @controller('app.project') appProjectController;

    /**
     * This action allows us to more from one page to the other
     *
     * @method paginate
     * @param {Integer} page The page that the user wishes to see
     * @public
     */
    @action paginate(page) {
        Logger.debug('Prometheus.Controllers.List::paginate(' + page + ')');
        this.set('page', page);
        Logger.debug('-Prometheus.Controllers.List::paginate');
    }

    /**
     * This action is used to sort the data
     *
     * @method sortData
     * @param field {String} The field that the user wishes to sort the data on
     * @public
     */
    @action sortData(field) {
        Logger.debug('Prometheus.Controllers.List::sortData(' + field + ')');

        // If the current field is being sorted then toggle it
        if (field === this.sort) {
            if (this.order === 'desc') {
                this.set('order', 'asc');
            } else {
                this.set('order', 'desc');
            }
        }
        // Otherwise start with the default value
        else {
            this.set('order', 'desc');
        }

        // Set the field that is being sorted, if it is changed then the model
        // update will be triggered by Ember
        this.set('sort', field);
        Logger.debug('-Prometheus.Controllers.List::sortData');
    }


    /**
     * This action is used to reload the page, whether it be with changes
     * in the parameters or without any change
     *
     * @method reloadPage
     * @public
     * @todo Hack Alert!!
     */
    @action reloadPage() {
        Logger.debug('Prometheus.Controllers.List::reloadPage');
        this.set('query', this.query + ' ');
        Logger.debug('-Prometheus.Controllers.List::reloadPage');
    }

    /**
     * Keep the query being searched in the controller
     *
     * @method populateQuery
     * @param {String} query
     * @return void
     * @public
     */
    @action populateQuery(query) {
        Logger.debug('Prometheus.Controllers.List::populateQuery');
        this.queryString = query;
        Logger.debug('-Prometheus.Controllers.List::populateQuery');
    }

    /**
     * Convert the rule object to string and perform searched
     *
     * @method searchByRules
     * @return void
     * @public
     */
    @action searchByRules() {
        Logger.debug('Prometheus.Controllers.List::searchByRules');
        let result = queryBuilder.getRules();

        if (!$.isEmptyObject(result)) {
            let query = queryParser.getQueryString(result);

            this.queryString = query;
            this.set('query', query);
            this.set('page', 1);
        }
        Logger.debug('-Prometheus.Controllers.List::searchByRules');
    }

    /**
     * Clear the search
     *
     * @method clearSearch
     * @return void
     * @public
     */
    @action clearSearch() {
        Logger.debug('Prometheus.Controllers.List::clearSearch');
        queryBuilder.clear();
        this.set('query', '');
        this.set('page', 1);
        Logger.debug('-Prometheus.Controllers.List::clearSearch');
    }

    /**
     * Open the filter view if not already Open
     *
     * @method openFilters
     * @public
     */
    @action openFilters() {
        Logger.debug('Prometheus.Controllers.List::openFilters');
        let filterEl = document.querySelector('.list-view-filters');
        $('.search [data-toggle=collapse]').click();
        if (!this._searchRulesHandler && (filterEl.ariaExpanded === 'true')) {
            this._searchRulesHandler = (e) => {
                if(e.key === 'Enter') {
                    let input = document.querySelector('.rule-value-container > input');
                    input && input.blur();
                    this.searchByRules();
                }
            };
            document.addEventListener('keydown', this._searchRulesHandler);
        }
        $('.search input').blur();
        Logger.debug('-Prometheus.Controllers.List::openFilters');
    }

    /**
     * Toggle the dropdown arrow on toggle
     *
     * @method toggleFilters
     * @private
     */
    @action toggleFilters() {
        Logger.debug('Prometheus.Controllers.List::toggleFilters');
        $('#toggleFilters').toggleClass('dropToggle');
        let filterEl = document.querySelector('.list-view-filters');
        
        if (filterEl.ariaExpanded === 'false') {
            document.removeEventListener('keydown', this._searchRulesHandler);
            this._searchRulesHandler = null;
            Logger.debug('Prometheus.Controllers.List::toggleFilters - Event listener removed');
        }
        Logger.debug('-Prometheus.Controllers.List::toggleFilters');
    }

    /**
     * This function is triggered when the checkbox on the the top right of
     * the list is clicked. This function only selects the items currently
     * visible in the list-view
     *
     * @method selectAll
     * @param {Event} evt
     * @return void
     * @todo allow the retention of the checkboxes across the multiple pages
     * @public
     */
    @action selectAll(evt) {
        let isChecked = evt.target.checked;
        let _self = this;
        let currentPage = this.page.toString();
        Logger.debug('Prometheus.Controllers.List::selectAll');

        if(!isChecked) {
            // Clear only the current page selections
            if (this.selectedIds[currentPage]) {
                delete this.selectedIds[currentPage];
            }
            this.isAllSelected = false;
        } else {
            // Initialize the array for current page if not exists
            if (!this.selectedIds[currentPage]) {
                this.selectedIds[currentPage] = [];
            } else {
                // Clear existing selections for this page
                this.selectedIds[currentPage] = [];
            }
        }

        // Select all the checkboxes in the list view
        _.each($('.list-view input[type=checkbox]').not('[data-select=all], [data-input-type=switch]'), function (element) {
            element.checked = isChecked;
            if(isChecked) {
                _self.selectedIds[currentPage].push(element.dataset.select);
                _self.isAllSelected = true;
            }
        });

        // Update total selected count across all pages
        this.selectedCount = this.getTotalSelectedCount();
        Logger.debug('-Prometheus.Controllers.List::selectAll');
    }

    /**
     * This function is triggered when an item in the list is selected
     *
     * @method select
     * @param {Event} evt
     * @return void
     * @todo allow the retention of the checkboxes across the multiple pages
     * @todo convert to a component
     *@public
     */
    @action select(evt) {
        let isChecked = evt.target.checked;
        let id = evt.target.dataset.select;
        let currentPage = this.page.toString();
        
        Logger.debug('Prometheus.Controllers.List::select');
        
        // Initialize the array for current page if not exists
        if (!this.selectedIds[currentPage]) {
            this.selectedIds[currentPage] = [];
        }
        
        // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
        if (!isChecked) {
            let selectAll = $('[data-select=all]').prop('checked');
            if (selectAll) {
                this.isAllSelected = false;
            }
            // Remove the id from the current page's selected ids
            this.selectedIds[currentPage] = this.selectedIds[currentPage].filter((item) => item !== id);
            
            // Remove the page entry if empty
            if (this.selectedIds[currentPage].length === 0) {
                delete this.selectedIds[currentPage];
            }
        }
        // If all the items in the list were selected then check the select all checkbox as well
        else {
            // Add the id to the current page's selected ids if not already there
            if (!this.selectedIds[currentPage].includes(id)) {
                this.selectedIds[currentPage].push(id);
            }
            
            // if checked boxes are equal to total boxes then enable check all box
            if ($('.list-view input[type=checkbox]:checked').not('[data-select=all], [data-input-type=switch]').length === $('.list-view input[type=checkbox]').not('[data-select=all], [data-input-type=switch]').length) {
                this.isAllSelected = true;
            }
        }
        
        // Update total selected count across all pages
        this.selectedCount = this.getTotalSelectedCount();
        Logger.debug('-Prometheus.Controllers.List::select');
    }

    /**
     * Get the total count of selected items across all pages
     * 
     * @method getTotalSelectedCount
     * @private
     * @returns {Number} Total count of selected items
     */
    getTotalSelectedCount() {
        let count = 0;
        for (const page in this.selectedIds) {
            if (this.selectedIds.hasOwnProperty(page)) {
                count += this.selectedIds[page].length;
            }
        }
        return count;
    }

    /**
     * This function is used to help navigate to the create issue page
     *
     * @method createIssue
     * @public
     */
    @action create(module) {
        Logger.debug("Prometheus.Controllers.List::create");
        this.transitionToRoute('app.project.' + module + '.create');
        Logger.debug("-Prometheus.Controllers.List::create");
    }

    /**
     * This function is used to apply the saved searches
     *
     * @method applySearch
     * @param {Prometheus.Models.Savedsearch} search
     * @public
     */
    @action applySearch(search) {
        Logger.debug('Prometheus.Controllers.List::applySearch');
        this.set('query', search.get('searchquery'));
        this.set('page', 1);
        Logger.debug('-Prometheus.Controllers.List.Index::applySearch');
    }

    /**
     * This function is used to display the dialog that allows user to save
     * their searches
     *
     * @method showSaveSearchDialog
     * @public
     */
    @action showSaveSearchDialog() {
        Logger.debug('Prometheus.Controllers.List::showSaveSearchDialog');
        let _self = this;
        _self.send('searchByRules');
        _self.set('saveSearchDialog', true);
        Logger.debug('-Prometheus.Controllers.List::showSaveSearchDialog');
    }

    /**
     * This function is used to hide the dialog that allows user to save
     * their searches
     *
     * @method removeSaveSearchDialog
     * @public
     */
    @action removeSaveSearchDialog() {
        Logger.debug('Prometheus.Controllers.List::removeSaveSearchDialog');
        this.set('saveSearchDialog', false);
        $('.modal').modal('hide');
        Logger.debug('-Prometheus.Controllers.List::removeSaveSearchDialog');
    }

    /**
     * This function checks if there are any selected items or if a search query is required
     * before displaying the export dialog. If no items are selected or a search query is required,
     * it displays an error message using the Messenger class.
     * 
     * @method showExportDialog
     * @returns {void}
     */
    @action showExportDialog() {
        Logger.debug('Prometheus.Controllers.List::showExportDialog');
        let moduleName = this.model.modelName;

        if(this.checkboxCount === 0) {
            let message = this.intl.t('views.app.module.list.export.noItemsSelected', {moduleName: moduleName});
            new Messenger().post({
                message: message,
                type: 'error',
                showCloseButton: true
            });
            return;
        }

        if(this.isAllSelected && _.isEmpty(this.query)) {
            let message = this.intl.t('views.app.module.list.export.searchQueryRequired', {
                moduleName: moduleName
            });
            new Messenger().post({
                message: message,
                type: 'error',
                showCloseButton: true
            });
            return;
        }

        this.exportDialog = true;
        Logger.debug('-Prometheus.Controllers.List::showExportDialog');
    }

    /**
     * This function hides the modal dialog, resets the export dialog state,
     * and clears the export relationships array.
     * 
     * @method removeExportDialog
     * @public 
     */
    @action removeExportDialog() {
        Logger.debug('Prometheus.Controllers.List::removeExportDialog');
        this.exportDialog = false;
        $('.modal').modal('hide');
        this.exportRelationships = [];
        Logger.debug('-Prometheus.Controllers.List::removeExportDialog');
    }

    /**
     * Exports modules by making an API call to fetch the data and then triggers a download.
     * 
     * @async
     * @function exportModules
     * @param {string} moduleName - The name of the module to export.
     * @returns {Promise<void>} - A promise that resolves when the export is complete.
     * @memberof PrometheusController
     * @instance
     */
    @action 
    async exportModules() {
        let _self = this;
        let moduleName = this.model.modelName;

        const options  = _self.prepareOptionsForExport();
        const URL = `${ENV.api.host}/api/v${ENV.api.version}/${moduleName}?${$.param(options)}`;
        const moduleTranslated = this.intl.t(`global.module.plural.${moduleName.toLowerCase()}`);
        const messageDuration = 3; //seconds in which messenger notification will hide


        const messenger = new Messenger().post({
            message: this.intl.t('views.app.module.list.export.exporting', {moduleName: moduleTranslated}),
            type: 'success',
            showCloseButton: false,
            hideAfter: false
        });

        try {
            let response = await fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${_self.session.data.authenticated.access_token}`
                }
            });

            if(response.ok) {
                let data = await response.json();
                let downloadUrl = `${ENV.api.host}${data.download_url}`;
                let link = document.createElement('a');
                link.href = downloadUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.removeExportDialog();

                messenger.update({
                    message: this.intl.t('views.app.module.list.export.exported', {moduleName: moduleTranslated}),
                    type: 'success',
                    showCloseButton: true,
                    hideAfter: messageDuration*2
                });
            } else {
                messenger.update({
                    message: this.intl.t('views.app.module.list.export.error', {moduleName: moduleTranslated}),
                    type: 'error',
                    showCloseButton: true,
                    hideAfter: messageDuration
                });
            }
        } catch (error) {
            messenger.update({
                message: this.intl.t('views.app.module.list.export.error', {moduleName: moduleTranslated}),
                type: 'error',
                showCloseButton: true,
                hideAfter: messageDuration
            });
        }
    }

    /**
     * Prepares the options object for exporting data.
     *
     * @method prepareOptionsForExport
     * @returns {Object} The options object with export settings.
     */
    prepareOptionsForExport() {
        Logger.debug('Prometheus.Controllers.List::prepareOptionsForExport');
        
        let selectedIds = this.getSelectedIds();
        
        let ids = selectedIds.join(',');
        let options = {
            ids: ids,
            projectId: this.trackedProject.id,
            export: true,
            limit: -1
        };

        if(!_.isEmpty(this.exportRelationships)) {
            let rels = this.exportRelationships.map(relationship => relationship.value).join(',');
            options.rels = rels;
        }

        if(this.isAllSelected) {
            options.query = this.query;
            options.selectAll = true;
        }

        Logger.debug('-Prometheus.Controllers.List::prepareOptionsForExport');
        return options;
    }

    /**
     * This function is used to display the mass update dialog.
     * 
     * @method showMassUpdateDialog
     * @public
     */
    @action showMassUpdateDialog() {
        Logger.debug('Prometheus.Controllers.List::showMassUpdateDialog');
        let moduleName = this.model.modelName;
        this.massUpdateModel = this.store.createRecord(moduleName, {
            priority: null
        });

        if(this.checkboxCount === 0) {
            let message = this.intl.t('views.app.module.list.noModuleSelected', {moduleName: `${moduleName}s`});
            new Messenger().post({
                message: message,
                type: 'error',
                showCloseButton: true
            });
            return;
        }
        this.massUpdateDialog = true;
        Logger.debug('-Prometheus.Controllers.List::showMassUpdateDialog');
    }

    /**
     * This function is used to hide the mass update dialog.
     * 
     * @method removeMassUpdateDialog
     * @public
     */
    @action removeMassUpdateDialog() {
        Logger.debug('Prometheus.Controllers.List::removeMassUpdateDialog');
        this.massUpdateDialog = false;
        this.massUpdateModel.unloadRecord();
        $('.modal').modal('hide');
        Logger.debug('-Prometheus.Controllers.List::removeMassUpdateDialog');
    }

    /**
     * This function handles the deletion of a model with a confirmation dialog.
     * It displays a warning message with confirm/cancel actions, and shows progress
     * updates during the deletion process.
     * 
     * @method deleteModel
     * @public
     * @param {Object} model - The model instance to be deleted
     * @param {String} fieldToDisplay - The field name to display in the confirmation message
     * @returns {Promise} A promise that resolves when the deletion is complete
     */
    @action 
    async deleteModel(model, fieldToDisplay) {
        Logger.debug('Prometheus.Controllers.List::delete');
        let _self = this;
        let moduleName = model.constructor.modelName;
        let moduleTranslated = _self.intl.t(`global.module.singular.${moduleName.toLowerCase()}`);

        let messenger = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.module.list.delete.message", {
                moduleName: moduleTranslated,
                name: model.get(fieldToDisplay)
            })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.module.list.delete.confirmDelete", {
                        moduleName: moduleTranslated
                    })).string,
                    action: async function () {
                        messenger.update({
                            message: _self.intl.t("views.app.module.list.delete.deleting", {
                                moduleName: moduleTranslated
                            }),
                            type: 'info',
                            actions: false,
                            hideAfter: false
                        });

                        await model.destroyRecord();
                        messenger.update({
                            message: _self.intl.t("views.app.module.list.delete.deleted", {
                                moduleName: moduleTranslated
                            }),
                            type: 'success',
                            actions: false,
                            hideAfter: 3
                        });
                    }
                },
                cancel: {
                    label: htmlSafe(_self.intl.t("views.app.module.list.delete.onsecondthought")).string,
                    action: function () {
                        return messenger.update({
                            message: _self.intl.t("views.app.module.list.delete.deletecancel"),
                            type: 'success',
                            actions: false,
                            hideAfter: 3
                        });
                    }
                },
            }
        });
        
        Logger.debug('-Prometheus.Controllers.List::delete');
    }

    /**
     * This function returns all the selected ids from all the pages.
     * 
     * @method getSelectedIds
     * @returns {Array} An array of all the selected ids
     */
    getSelectedIds() {
        Logger.debug('Prometheus.Controllers.List::getSelectedIds');
        let selectedIds = [];
        for (const page in this.selectedIds) {
            if (this.selectedIds.hasOwnProperty(page)) {
                selectedIds = selectedIds.concat(this.selectedIds[page]);
            }
        }
        Logger.debug('-Prometheus.Controllers.List::getSelectedIds');
        return selectedIds;
    }

    /**
     * Get the count of selected checkboxes.
     * 
     * @property checkboxCount
     * @type {Number}
     * @public
     */
    get checkboxCount() {
        Logger.debug('Prometheus.Controllers.List::checkboxCount');
        if (this.model.length) { 
           scheduleOnce('afterRender', this, () => {
               this.updateCheckboxState(this.page);
           });
        }
        Logger.debug('-Prometheus.Controllers.List::checkboxCount');
        return this.selectedCount;
    }

    /**
     * Update the checkbox state for the selected items.
     * 
     * @method updateCheckboxState
     * @param {Number} currentPage - The current page number
     * @public
     */
    updateCheckboxState(currentPage) {
        Logger.debug('Prometheus.Controllers.List::updateCheckboxState');
        let modelName = this.model.modelName;
        for (const page in this.selectedIds) {
            if (this.selectedIds.hasOwnProperty(page)) {
                this.selectedIds[page].forEach(id => {
                    let el = document.querySelector(`tr[data-${modelName}-id='${id}'] input[type=checkbox]`);
                    el && (el.checked = true);
                });
            }
        }

        let selectAll = false;
        if(this.model.length === this.selectedIds[currentPage]?.length) {
            selectAll = true;
        }

        document.querySelectorAll('[data-select="all"]').forEach(el => {
            el.checked = selectAll;
        });

        Logger.debug('-Prometheus.Controllers.List::updateCheckboxState');
    }
}
