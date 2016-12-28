import Ember from "ember";

/**
  This is the controller for the calendar controller route

  @class AppProjectCalendarController
  @extends Ember.Controller
*/
export default Ember.Controller.extend({

  /**
   The current user service

   @property currentUser
   @type Ember.Service
   @for AppProjectConversationController
   @public
  */
  currentUser: Ember.inject.service(),

  events: Ember.A([{
   title: 'Event 1',
   start: '2016-05-05T07:08:08',
   end: '2016-05-05T09:08:08'
  }, {
   title: 'Event 2',
   start: '2016-05-06T07:08:08',
   end: '2016-05-07T09:08:08'
  }, {
   title: 'Event 3',
   start: '2016-05-10T07:08:08',
   end: '2016-05-10T09:48:08'
  }, {
   title: 'Event 4',
   start: '2016-05-11T07:15:08',
   end: '2016-05-11T09:08:08'
 }]),


  /**
   These are the actions that are handled by this controller

   @property actions
   @type Object
   @for AppProjectCalendarController
   @public
  */
  actions: {

   } // end definition actions
});
