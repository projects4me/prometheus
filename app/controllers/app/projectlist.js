import Ember from "ember";
import _ from "lodash";
import navi from "../../utils/navigation/navigation";
import queryParser from "../../utils/query/parser";
import queryBuilder from "../../utils/query/builder";
import MD from "../../utils/metadata/metadata";

/**
The controller for the module route, it is loaded when a user tried to navigate to the route
:module
e.g. acme.projects4.me/app/projects
By default this controller is configured to load the list view, if a custom implementation of list view is required then it must extend from this class

@class app.module
@module app
@submodule Controller
@namespace Prometheus
@extends Ember.Controller
*/

export default Ember.Controller.extend({
  /**
    The count of the selected items in the list view.

    @property selectedCount
    @for app.module
    @type Integer
    @private
  */
  selectedCount:0,

  /**
    Query params that the controller needs to support

    @property queryParams
    @for app.module
    @type Array
    @private
    @todo See this can be dynamic
  */
  queryParams: ['page','query','sort','order'],

  /**
    The current page number

    @property page
    @for app.module
    @type Integer
    @public
  */
  page:1,

  /**
    The current query

    @property query
    @for app.module
    @type String
    @public
  */
  query:null,

  /**
    The current query string

    @property queryString
    @for app.module
    @type String
    @public
  */
  queryString:null,

  /**
    The current sorted property

    @property sort
    @for app.module
    @type String
  */
  sort:null,

  /**
    The current sorted property

    @property sortOrder
    @for app.module
    @type String
  */
  sortOrder:'desc',

  /**
    Setup Controller function is called by the router at the end of the
    setupController function defined in the app.module route. This function
    is used to perform actions required at the start of each render cycle.

    This is a replacement of init function which is only called once but if the
    setupController function in router calls this function then it is called
    every time a user tries to visit the rout

    @method setupController
    @for app.module
    @private
  */
  setupController: function () {
    this._super();
    // call initialize action after the view has been rendered
    Ember.run.schedule("afterRender",this,function() {
      this.send("setupQuery");
    });
  },

  /**
    The action handlers for the view

    @property action
    @for app.module
    @type Object
    @public
  */
  actions:{
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

      this.set('selectedCount',Ember.$('.list-view input[type=checkbox]:checked').not('[data-select=all]').length);
    },

    /**
     This function is triggerd when an item in the list is selected

     @method select
     @param value {Boolean} whether the checkbox was selected of not
     @return void
     @todo allow the retention of the checkboxes across the multiple pages
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
     This action is triggerd when a user tries to navigate to the deatil view

     @method detail
     @param id {String} the identifier of the module
     @return void
     @public
     */
    detail:function(id){
      //var URIData = navi.buildURL(Ember.String.camelize(this.module),'detail',{id:id});
      this.transitionToRoute("app.project.index",{projectId:id});
    },

    /**
      This function is used to handle pagination

      @method paginate
      @param pages
      @return void
      @public
    */
    paginate:function(page){
      this.set('selectedCount',0);
      Ember.$('[data-select=all]').prop('checked',false);
      this.set('page',page);
      this.send('navigate');
    },

    /**
      This function is used to handle search queries

      @method filter
      @param query
      @return void
      @public
      @todo Validate query before submission
    */
    filter:function(){
        this.send('navigate');
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
      this.send('setupQuery');
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
        /*
        var URIData = navi.buildURL(Ember.String.camelize(this.module),'module');
        this.transitionToRoute(URIData.route,URIData.options,{ queryParams: { page: this.page, query:this.queryString }});
        */
        this.send('navigate');
      }
    },
    i18n:null,
    /**
      This function will be used to initialize the page and initialize the query
      using jQuery Query Builder

      @method initialize
      @for app.module
      @private
    */
    setupQuery:function(){
      Logger.debug('Setup query');
      var i18n = this.get('i18n');
      var filters = MD.create().getViewMeta('Project','filters',i18n).enabledFilters;
      var rules = queryParser.getRules(this.get('query'),filters);
      Logger.debug(rules);
      Logger.debug(filters);
      queryBuilder.init('#builder',filters);
      if (rules !== undefined && rules !== '') {
        queryBuilder.setRules(rules);
      }
    },
    /**
      This metho is responsible for getting data sorted

      @method sortData
      @for app.module
      @private
    */
    sortData:function(field){
      //field = this.module+'.'+field;
      // If the field is already being sorted on then just toggle it
      if (field === this.sort) {
        if (this.sortOrder === 'desc') {
          this.set('sortOrder','asc');
        } else {
          this.set('sortOrder','desc');
        }
      }
      // Else first clear the previous sort and set the new one
      /**
        @todo for some reason sortOrder is not set before navigation
      */
      else {
        Ember.$('[data-sort="'+this.sort+'Sortable"]').attr('class','sortable');
        this.set('sortOrder','desc');
        this.set('sort',field);
      }

      // Set the styling
      Ember.$('[data-sort="'+field+'Sortable"]').attr('class','sortable sortable-'+this.sortOrder);

      // Perform the sorting
      this.send('navigate');
    },

    /**
      Navigate to the desired page in the list

      @method navigate
      @for app.module
      @private
    */
    navigate:function(){
      if (this.page === undefined || this.page === '' || this.page === null){
        this.set('page',0);
      }
      //var URIData = navi.buildURL(Ember.String.camelize(this.module),'projectlist');
      //this.send('navigateRoute',URIData.route,{ queryParams: { page: this.page, query:this.queryString, sort:this.sort, order:this.sortOrder }});
      //this.transitionToRoute(URIData.route,{ queryParams: { page: this.page, query:this.queryString, sort:this.sort, order:this.sortOrder }});
      Logger.debug("Trying to navigate .... ");
      this.send('refreshRoute',{ queryParams: { page: this.page, query:this.queryString, sort:this.sort, order:this.sortOrder }});
    },

    /**
      Open the filter view if not already Open

      @method openFilters
    */
    openFilters:function(){
      if (Ember.$('.list-view-filters').css('display') === 'none'){
        Ember.$('.search [data-toggle=collapse]').click();
      }
    },

    /**
      Toggle the dropdown arrow on toggle

      @method toggleFilters
      @for app.module
      @private
    */
    toggleFilters:function(){
      Ember.$('#toggleFilters').toggleClass('dropToggle');
    }
  }
});
