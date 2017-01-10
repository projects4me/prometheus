/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import _ from "lodash";
import queryBuilder from "../../../../utils/query/builder";
import queryParser from "../../../../utils/query/parser";

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
    The count of the selected items in the list view.

    @property selectedCount
    @for AppProjectIssueController
    @type Integer
    @private
  */
  selectedCount: 0,

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
      @public
    */
    sortData:function(field){
      Logger.debug('AppProjectIssueController::sortData('+field+')');

      // If the current field is being sorted then toggle it
      if (field === this.get('sort')) {
        if (this.get('order') === 'desc') {
          this.set('order','asc');
        } else {
          this.set('order','desc');
        }
      }
      // Otherwise start with the default value
      else {
        this.set('order','desc');
      }

      // Set the field that is being sorted, if it is changed then the model
      // update will be triggered by Ember
      this.set('sort',field);
      Logger.debug('-AppProjectIssueController::sortData()');
    },


    /**
      This action is used to reload the page, whether it be with changes in the
      paramters or without any change

      @method reloadPage
      @public
      @todo Hack Alert!!
    */
    reloadPage:function(){
      Logger.debug('AppProjectIssueController::reloadPage()');
      // Hack Alert!!!
      this.set('query',this.get('query')+' ');
      Logger.debug('-AppProjectIssueController::reloadPage()');
    },

    /**
      Keep the query being searched in the controller

      @method populateQuery
      @param query
      @return void
      @public
      @todo allow auto complete
    */
    populateQuery:function(query){
      this.queryString = query;
    },

    /**
      Conver the rul object to string and perform searched

      @method searchByRules
      @return void
      @public
    */
    searchByRules:function(){
      var result = queryBuilder.getRules();
      if (!Ember.$.isEmptyObject(result)) {
        var query = queryParser.getQueryString(result);
        this.queryString = query;
        this.set('query', query);
      }
    },

    /**
      Open the filter view if not already Open

      @method openFilters
    */
    openFilters:function(){
      Ember.$('.search [data-toggle=collapse]').click();
      Ember.$('.search input').blur();
    },

    /**
      Toggle the dropdown arrow on toggle

      @method toggleFilters
      @for app.module
      @private
    */
    toggleFilters:function(){
      Ember.$('#toggleFilters').toggleClass('dropToggle');
    },

    /**
     This function is triggered when the checkbox on the the top right of the list is called
     This function only selects the items currently visible in the list-view

     @method selectAll
     @param value {Boolean} whether the selectAll checkbox was selected of not
     @return void
     @todo allow the retention of the checkboxes across the multiple pages
     @public
     */
    selectAll:function(value){
      // Select all the checkboxes in the list view
      _.each(Ember.$('.list-view input[type=checkbox]').not('[data-select=all]'),function(element) {
        element.checked = value;
      });

      _.each(Ember.$('.list-view [data-select=all]'),function(element) {
        element.checked = value;
      });


      this.set('selectedCount',Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);
    },

    /**
     This function is triggerd when an item in the list is selected

     @method select
     @param value {Boolean} whether the checkbox was selected of not
     @return void
     @todo allow the retention of the checkboxes across the multiple pages
     @todo convert to a component
     @public
     */
    select:function(value){
      // Select/Deslect one checkboxes in the list view
      this.set('selectedCount',Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);

      // uncheck the select all checkbox, if an item was deselected and the select all checkbox was checked
      if (!value) {
        var selectAll = Ember.$('[data-select=all]').prop('checked');
        if (selectAll){
          Ember.$('[data-select=all]').prop('checked',false);
        }
      }
      // If all the items in the list were selected then check the select all checkbox as well
      else {
        // if checked boxes are equal to total boxes then enable check all box
        if (Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length === Ember.$('.list-view input[type=checkbox]').not('[data-select=all]').length) {
          Ember.$('[data-select=all]').prop('checked',true);
        }
      }
    },

    /**
      This function is used to navigate the user to the detail page for the issues

      @method openDetail
      @param issue {IssueModel} Te issue model to which we have to navigate to
      @public
    */
    openDetail:function(issue){
      Logger.debug("AppProjectIssueController::openDetail");
      Logger.debug(issue);
      Logger.debug(this.get('model'));
      this.transitionToRoute('app.project.issue.page',{issueNumber:issue.get('issueNumber'),issues:this.get('model')});
      Logger.debug("-AppProjectIssueController::openDetail");
    },

  }
});
