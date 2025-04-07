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
    page = 1;

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
    selectedCount = 0;

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
     *
     * @property selectedIds
     * @for List
     * @type Array
     * @public
     */
    @tracked selectedIds = [];

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
        Logger.debug('Prometheus.Controllers.List::selectAll');

        if(!isChecked) {
            this.selectedIds = [];
            this.isAllSelected = false;
        }

        // Select all the checkboxes in the list view
        _.each($('.list-view input[type=checkbox]').not('[data-select=all], [data-input-type=switch]'), function (element) {
            element.checked = isChecked;

            if(isChecked) {
                _self.selectedIds.push(element.dataset.select);
                _self.isAllSelected = true;
            }
        });

        _.each($('.list-view [data-select=all]'), function (element) {
            element.checked = isChecked;
        });

        this.set('selectedCount', $('.list-view input[type=checkbox]:checked').not('[data-select=all], [data-input-type=switch]').length);
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

        Logger.debug('Prometheus.Controllers.List::select');
        // Select/Deselect one checkboxes in the list view
        this.set('selectedCount', $('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);

        // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
        if (!isChecked) {
            let selectAll = $('[data-select=all]').prop('checked');
            if (selectAll) {
                $('[data-select=all]').prop('checked', false);
                this.isAllSelected = false;
            }
            this.selectedIds = this.selectedIds.filter((item) => item !== id);
        }
        // If all the items in the list were selected then check the select all checkbox as well
        else {
            // if checked boxes are equal to total boxes then enable check all box
            if ($('.list-view input[type=checkbox]:checked').not('[data-select=all], [data-input-type=switch]').length === $('.list-view input[type=checkbox]').not('[data-select=all], [data-input-type=switch]').length) {
                $('[data-select=all]').prop('checked', true);
                this.isAllSelected = true;
            }
            this.selectedIds.push(id);
        }
        Logger.debug('-Prometheus.Controllers.List::select');
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

        if(_.isEmpty(this.selectedIds)) {
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
        let ids = this.selectedIds.join(',');
        let options = {
            ids: ids,
            projectId: this.trackedProject.id,
            export: true,
            limit: -1
        };

        if(!_.isEmpty(this.exportRelationships)) {
            options.rels = this.exportRelationships.join(',');
        }

        if(this.isAllSelected) {
            options.query = this.query;
            options.selectAll = true;
        }

        return options;
        Logger.debug('-Prometheus.Controllers.List::prepareOptionsForExport');
    }
}
