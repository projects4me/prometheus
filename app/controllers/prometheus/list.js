/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import _ from "lodash";
import queryBuilder from "prometheus/utils/query/builder";
import queryParser from "prometheus/utils/query/parser";
import $ from 'jquery';
import { inject as controller } from '@ember/controller';
import { reads } from '@ember/object/computed';
import { action } from '@ember/object';

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
     * The empty saved search object that we utilize for saving searches
     *
     * @property savedsearch
     * @for List
     * @type Prometheus.Models.Savedsearch
     * @public
     */
    savedsearch = null;

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
        $('.search [data-toggle=collapse]').click();
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
        Logger.debug('Prometheus.Controllers.List::selectAll');
        // Select all the checkboxes in the list view
        _.each($('.list-view input[type=checkbox]').not('[data-select=all], [data-field="user.accountStatus"]'), function (element) {
            element.checked = isChecked;
        });

        _.each($('.list-view [data-select=all]'), function (element) {
            element.checked = isChecked;
        });

        this.set('selectedCount', $('.list-view input[type=checkbox]:checked').not('[data-select=all]').not('[data-field="user.accountStatus"]').length);
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
        let isChecked = evt.target.checked
        Logger.debug('Prometheus.Controllers.List::select');
        // Select/Deselect one checkboxes in the list view
        this.set('selectedCount', $('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);

        // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
        if (!isChecked) {
            let selectAll = $('[data-select=all]').prop('checked');
            if (selectAll) {
                $('[data-select=all]').prop('checked', false);
            }
        }
        // If all the items in the list were selected then check the select all checkbox as well
        else {
            // if checked boxes are equal to total boxes then enable check all box
            if ($('.list-view input[type=checkbox]:checked').not('[data-select=all]').length === $('.list-view input[type=checkbox]').not('[data-select=all]').length) {
                $('[data-select=all]').prop('checked', true);
            }
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
}
