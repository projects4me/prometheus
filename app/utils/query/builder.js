import Ember from "ember";

/**
  This utility class is used for help interact with the plugin jQuery Query
  Builder querybuilder.js.org

  @class builder
  @module App.utils
  @submodule query
  @namespace Prometheus
*/
export default {

  /**
    The current elemet that the query is applied on

    @param element
    @type String
    @for App.utils
    @private
  */
  element:null,

  /**
    The current filters that the query is applied on

    @param filters
    @type Array
    @for App.utils
    @private
  */
  filters:null,

  /**
    Initialize a query builder objects

    @method init
    @param element {String} the selector of the element that will use the plugin
    @for App.utils
    @public
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
    Set the rules

    @method setRules
    @for App.utils
    @public
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
    Clear the rules set

    @method clear
    @for App.utils
    @public
  */
  clear:function(){
    if (this.elemet === null)
    {
      throw 'First initialize the utility';
    }
    Ember.$(this.element).queryBuilder('reset');
  },

  /**
    Clear the rules set

    @method clear
    @for App.utils
    @return rules {Object} The rules set in the interface
    @public
  */
  getRules:function(){
    if (this.elemet === null)
    {
      throw 'First initialize the utility';
    }
    return Ember.$(this.element).queryBuilder('getRules');
  }

};
