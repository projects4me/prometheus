/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import queryParser from "../utils/query/parser";
import queryBuilder from "../utils/query/builder";
import MD from "../utils/metadata/metadata";
import { observer } from '@ember/object';
import Component from '@ember/component';
import { inject } from '@ember/service';
import { getOwner } from '@ember/application';
import queryBuilderOperators from "prometheus/utils/metadata/querybuilder-operators";

/**
 * This component is used to render the chat-boxes in the application
 *
 * @class QueryBuilder
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for QueryBuilder
     * @private
     */
    intl: inject(),

    /**
     * These are the classes the must be registered with the component
     *
     * @property classNames
     * @type Array
     * @for QueryBuilder
     * @private
     */
    classNames: ["query-builder"],

    /**
     * These are the filter that are applicable for this
     * instance
     *
     * @property filters
     * @type Array
     * @for QueryBuilder
     * @private
     */
    filters:null,

    /**
     * This is the query that is passed to this instance of
     * query builder
     *
     * @property query
     * @type Array
     * @for QueryBuilder
     * @public
     */
    query:null,

    /**
     * Mapping of module names to their controller paths
     * 
     * @property controllerPaths
     * @type Object
     * @for QueryBuilder
     * @private
     */
    controllerPaths: {
        'issue': 'app.project.issue.index',
        'project': 'app.projects.index'
    },


    /**
     * This is an observer function that is triggered whenever
     * a query is changed so that we can reset the rules based
     * on the changed query
     *
     * @methos queryDidChange
     * @for QueryBuilder
     * @private
     */
    queryDidChange: observer('query', function() {
        let _self = this;
        let filters = _self.get('filters');

        if (filters !== null) {
            _self._setRules(filters);
        }
    }),

    /**
     * This function is called by Ember after it has finished rendering the HTML elements, we
     * use this function in order to setup the query builder
     *
     * @method didInsertElement
     * @public
     */
    didInsertElement(){
        let _self = this;
        let intl = _self.intl;
        let controller = getOwner(_self).lookup(`controller:${_self.controllerPaths[_self.module]}`);
        let filters = controller.metadata.filters;
        filters.map((filter) => {
            filter.operators = queryBuilderOperators[filter.type];
        });
        
        _self.set('filters',filters);

        queryBuilder.init('#'+this.elementId,filters);
        _self._setRules(filters);
    },

    /**
     * This function is used to set the rules for the query builder
     *
     * @method _setRules
     * @param filters
     * @private
     */
    _setRules(filters){
        let rules = queryParser.getRules(this.query,filters);

        if (rules !== undefined && rules !== '') {
            queryBuilder.setRules(rules);
        }
    },

    /**
     * This function is call by Ember when it is about to destroy the HTML elements rendered. We
     * use this function in order to destroy the querybuilder object we initiated
     *
     * @method willDestroyElement
     * @public
     */
    willDestroyElement(){
        queryBuilder.destroy('#'+this.elementId);
    }

});