/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This utility class is used for help interact with the plugin jQuery Query
 * Builder querybuilder.js.org
 *
 * @class Builder
 * @namespace Prometheus.Utils
 * @module Query
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default {

    /**
     * The current element that the query is applied on
     *
     * @property element
     * @type String
     * @for Builder
     * @private
     */
    element:null,

    /**
     * The current filters that the query is applied on
     *
     * @property filters
     * @type Array
     * @for Builder
     * @private
     */
    filters:null,

    /**
     * Initialize a query builder objects
     *
     * @method init
     * @param {String} element the selector of the element that will use the plugin
     * @param {Array} filters The filters to be used
     * @for Builder
     * @public
     */
    init:function(element,filters){
        this.element = element;
        this.filters = filters;
        Ember.$(element).queryBuilder({
            plugins: ['bt-tooltip-errors'],
            operators: [
                'equal',
                'not_equal',
                'in',
                'not_in',
                'less',
                'less_or_equal',
                'greater',
                'greater_or_equal',
                'between',
                'not_between',
                'begins_with',
                'not_begins_with',
                'contains',
                'not_contains',
                'ends_with',
                'not_ends_with',
                'is_empty',
                'is_not_empty',
                'is_null',
                'is_not_null'
            ],
            filters: filters
        });
    },

    /**
     * Set the rules
     *
     * @method setRules
     * @param {Array} rules The rules applicable
     * @public
     */
    setRules:function(rules){
        if (this.elemet === null)
        {
            throw 'First initialize the utility';
        }
        Ember.$(this.element).queryBuilder('reset');
        Ember.$(this.element).queryBuilder('setRules', rules);
    },

    /**
     * Clear the rules set
     *
     * @method clear
     * @public
     */
    clear:function(){
        if (this.elemet === null)
        {
            throw 'First initialize the utility';
        }
        Ember.$(this.element).queryBuilder('reset');
    },

    /**
     * Get the rules set
     *
     * @method getRules
     * @return {Object} rules  The rules set in the interface
     * @public
     */
    getRules:function(){
        if (this.elemet === null)
        {
            throw 'First initialize the utility';
        }
        return Ember.$(this.element).queryBuilder('getRules');
    },

    /**
     * Destroy the query builder for a a particular element
     *
     * @method destroy
     * @param {Object} element
     * @public
     */
    destroy:function(element){
        Ember.$(element).queryBuilder('destroy');
    }

};