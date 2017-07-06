/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import queryParser from "../utils/query/parser";
import queryBuilder from "../utils/query/builder";
import MD from "../utils/metadata/metadata";

/**
 * This component is used to render the chat-boxes in the application
 *
 * @class QueryBuilder
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for QueryBuilder
     * @private
     */
    i18n: Ember.inject.service(),

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
     * This function is called by Ember after it has finished rendering the HTML elements, we
     * use this function in order to setup the query builder
     *
     * @method didInsertElement
     * @public
     */
    didInsertElement:function(){
        var i18n = this.get('i18n');
        var filters = MD.create().getViewMeta(this.get('module'),'filters',i18n).enabledFilters;
        var rules = queryParser.getRules(this.get('query'),filters);

        queryBuilder.init('#'+this.elementId,filters);
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
    willDestroyElement:function(){
        queryBuilder.destroy('#'+this.elementId);
    }

});