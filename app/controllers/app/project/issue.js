/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  This controller is used to provide the interaction between the template and
  the route. The basic features that this controller provide are pagination,
  sorting and filtering the data.

  @class AppProjectIssueController
  @extends Ember.Controller
*/
export default Ember.Controller.extend({

  /**
    Query params that the controller needs to support, it may seem that the
    same paramters are defined in both the route and the controller but is not
    the case exactly, the parameters defined in the route are meant for the model
    while the parameters defined in the controller are meant for the interaction
    with the view. e.g. the query might be different because the user might be
    composing it as compared to te query string that was last used to fetch the
    data.

    @property queryParams
    @for app.module
    @type Array
    @private
  */
  queryParams: ['sort','order','page','query'],

  /**
    This property stores the current sorting order of the page, storing it here
    allows us to toggle it.

    @property order
    @type String
    @for AppProjectIssueController
    @private
  */
  order: 'desc',

  /**
    This property stores the current page that the user is viewing,

    @property page
    @type String
    @for AppProjectIssueController
    @private
  */
  page: 1,

  /**
    This property stores the field on which the page if currently sored on

    @property sort
    @type String
    @for AppProjectIssueController
    @private
  */
  sort: 'Issue.issueNumber',

  /**
    This property stores the current query based on which the page is filtered.

    @property query
    @type String
    @for AppProjectIssueController
    @private
  */
  query: '',

  /**
    The action handlers for the issue list view

    @property action
    @for app.module
    @type Object
    @public
  */
  actions:{


    /**
      This action allows us to more from one page to the other

      @method paginate
      @param page {Integer} The page that the user wishes to see
      @public
    */
    paginate:function(page){
      Logger.debug('AppProjectIssueController::paginate('+page+')');

      this.set('page',page);
      Logger.debug('-AppProjectIssueController::paginate()');
    },

    /**
      THis action filters the data

      @method filter
      @public
    */
    filter:function(){
      Logger.debug('AppProjectIssueController::filter()');
      Logger.debug('-AppProjectIssueController::filter()');
    },

    /**
      This action is used to sort the data

      @method sortData
      @param field {String} The field that the user wishes to sort the data on
      @param order {String} The order in which the data is required to be sorted
      @public
    */
    sortData:function(field,order){
      Logger.debug('AppProjectIssueController::sortData('+field+','+order+')');

      this.set('sort',field);
      this.set('order',order);
      Logger.debug('-AppProjectIssueController::sortData()');
    },


    /**
      This action is used to reload the page, whether it be with changes in the
      paramters or without any change

      @method reloadPage
      @public
    */
    reloadPage:function(){
      Logger.debug('AppProjectIssueController::reloadPage()');

      this.transitionToRoute({
        queryParams: {
          query:this.get('query'),
          sort:this.get('sort'),
          order:this.get('order'),
          page:this.get('page'),
        }
      });

      Logger.debug('-AppProjectIssueController::reloadPage()');
    },

    /**
      This function is called when the search query has been changed

      @method updateQuery
      @param
      @public
    */
    updateQuery:function(){
      Logger.debug('AppProjectIssueController::updateQuery()');

      Logger.debug('-AppProjectIssueController::updateQuery()');
    }

  }
});
