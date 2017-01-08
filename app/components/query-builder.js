/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import queryParser from "../utils/query/parser";
import queryBuilder from "../utils/query/builder";
import MD from "../utils/metadata/metadata";

/**
  This component is used to render the chat-boxes in the application

  @class QueryBuilderComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for ChatBoxComponent
   @private
  */
  i18n: Ember.inject.service(),

  /**
    These are the classes the must be registered with the component

    @property classNames
    @type Array
    @for ChatBoxComponent
    @private
  */
  classNames: ["query-builder"],

  /**
    This
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

  willDestroyElement:function(){
    queryBuilder.destroy('#'+this.elementId);
  }

});
