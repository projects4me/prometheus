/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { action } from "@ember/object";
import { tracked } from '@glimmer/tracking';
import _ from "lodash";
import navi from "../../utils/navigation/navigation";
import { camelize } from '@ember/string';
import $ from 'jquery';

/**
 * The controller for the module route, it is loaded when a user tried to navigate to the route
 * :module
 * e.g. acme.projects4.me/app/projects
 * By default this controller is configured to load the list view, if a custom implementation of
 * list view is required then it must extend from this class
 *
 * @class Module
 * @namespace Prometheus.Controllers
 * @module App
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppModuleController extends PrometheusController {

    /**
     * The count of the selected items in the list view.
     *
     * @property selectedCount
     * @for Module
     * @type Integer
     * @private
     */
    selectedCount = 0;

    /**
     * Query params that the controller needs to support
     *
     * @property queryParams
     * @for Module
     * @type Array
     * @private
     * @todo See this can be dynamic
     */
    queryParams = ['page', 'query', 'sort', 'order'];

    /**
     * The current page number
     *
     * @property page
     * @for Module
     * @type Integer
     * @public
     */
    page = 0;

    /**
     * The current query
     *
     * @property query
     * @for Module
     * @type String
     * @public
     */
    query = null;

    /**
     * The current query string
     *
     * @property queryString
     * @for Module
     * @type String
     * @public
     */
    queryString = null;

    /**
     * The current sorted property
     *
     * @property sort
     * @for Module
     * @type String
     * @public
     */
    sort = null;

    /**
     * The current sorted property
     *
     * @property sortOrder
     * @for Module
     * @type String
     * @public
     */
    sortOrder = 'desc';

    /**
     * The ezSearch schema of the module, loaded by the route; null when the module declares no
     * search metadata (`views.<Module>.search`).
     *
     * @property querySchema
     * @for Module
     * @type Object
     * @public
     */
    @tracked querySchema = null;

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
    @action selectAll(value) {
        // Select all the checkboxes in the list view
        _.each($('.list-view input[type=checkbox]').not('[data-select=all]'), function (element) {
            element.checked = value;
        });

        this.set('selectedCount', $('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);
    }

    /**
     * This function is triggerd when an item in the list is selected
     *
     * @method select
     * @param {Boolean} value whether the checkbox was selected of not
     * @return void
     * @todo allow the retention of the checkboxes across the multiple pages
     * @public
     */
    @action select(value) {
        // Select/Deslect one checkboxes in the list view
        this.set('selectedCount', $('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);

        // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
        if (!value) {
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

    }

    /**
     * This action is triggered when a user tries to navigate to the detail view
     *
     * @method detail
     * @param {String} id the identifier of the module
     * @return void
     * @public
     */
    @action detail(id) {
        let URIData = navi.buildURL(camelize(this.module), 'detail', { id: id });
        this.transitionToRoute(URIData.route, URIData.options);
    }

    /**
     * This function is used to handle pagination
     *
     * @method paginate
     * @param {Integer} page
     * @return void
     * @public
     */
    @action paginate(page) {
        this.set('selectedCount', 0);
        $('[data-select=all]').prop('checked', false);
        this.set('page', page);
        this.send('navigate');
    }

    /**
     * Apply a query from ezSearch: keep it, go back to the first page and search by it.
     *
     * @method applyQuery
     * @param {String} query The Gaia query string, empty for none
     * @public
     */
    @action applyQuery(query) {
        this.queryString = query || null;
        this.set('query', this.queryString);
        this.set('page', 0);
        this.send('navigate');
    }

    /**
     * This method is responsible for getting data sorted
     *
     * @method sortData
     * @param {String} field
     * @private
     * @todo for some reason sortOrder in not set before navigation
     */
    @action sortData(field) {
        field = this.module + '.' + field;
        // If the field is already being sorted on then just toggle it
        if (field === this.sort) {
            if (this.sortOrder === 'desc') {
                this.set('sortOrder', 'asc');
            } else {
                this.set('sortOrder', 'desc');
            }
        }

        // Else first clear the previous sort and set the new one
        else {
            $('[data-sort="' + this.sort + 'Sortable"]').attr('class', 'sortable');
            this.set('sortOrder', 'desc');
            this.set('sort', field);
        }

        // Set the styling
        $('[data-sort="' + field + 'Sortable"]').attr('class', 'sortable sortable-' + this.sortOrder);

        // Perform the sorting
        this.send('navigate');
    }

    /**
     * Navigate to the desired page in the list
     *
     * @method navigate
     * @private
     */
    @action navigate() {
        if (this.page === undefined || this.page === '' || this.page === null) {
            this.set('page', 0);
        }
        let URIData = navi.buildURL(camelize(this.module), 'module');
        this.transitionToRoute(URIData.route, URIData.options, { queryParams: { page: this.page, query: this.queryString, sort: this.sort, order: this.sortOrder } });
    }
}
