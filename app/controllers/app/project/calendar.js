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
   @for AppProjectCalendarController
   @private
  */
  currentUser: Ember.inject.service(),

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for AppProjectCalendarController
   @private
  */
  i18n: Ember.inject.service(),

  /**
   Locale value, the default is en

   @property localeCode
   @type String
   @for AppProjectCalendarController
   @private
  */
  localeCode: 'en',

  /**
   These are the header option for the calendar

   @property header
   @type Object
   @for AppProjectCalendarController
   @public
  */
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'month,agendaWeek,agendaDay,listWeek'
  },

  events: null,


  /**
   These are the actions that are handled by this controller

   @property actions
   @type Object
   @for AppProjectCalendarController
   @public
  */
  actions: {
//    clicked(event, jsEvent, view){
//        this.showModal(event);
//    },
    eventDragStart:function(event){
      Logger.debug("AppProjectCalendarController::eventDragStart()");
      Logger.debug(event);
    },

    eventRender:function(event,eventElement){
      var self = this;
      if (event.priority)
      {
        eventElement.find('div.fc-content').prepend(this.getPriorityHTML(event.priority));
        eventElement.find('td.fc-list-item-title').prepend(this.getPriorityHTML(event.priority));
      }
      if (event.className)
      {
        var tooltip = self.get('i18n').t("view.app.issue.lists.priority."+event.priority);
        tooltip += ' '+self.get('i18n').t("view.app.issue.priority");
        tooltip += ' - '+self.get('i18n').t("view.app.issue.lists.status."+event.className);
        eventElement.find('div.fc-content').attr('data-toggle','tooltip');
        eventElement.find('div.fc-content').attr('title',tooltip);
        //eventElement.find('td.fc-list-item-title').prepend(this.getPriorityHTML(event.priority));
      }
    },


  }, // end definition actions


  getPriorityHTML:function(priority){
    var HTML = '';
    switch (priority) {
      case 'blocker':
        HTML += '<i class="fa fa-ban"></i>';
        break;
      case 'critical':
        HTML += '<i class="fa fa-angle-double-up"></i>';
        break;
      case 'high':
        HTML += '<i class="fa fa-arrow-up"></i>';
        break;
      case 'medium':
        HTML += '<i class="fa fa-dot-circle-o"></i>';
        break;
      case 'low':
        HTML += '<i class="fa fa-arrow-down"></i>';
        break;
      case 'lowest':
        HTML += '<i class="fa fa-angle-double-down"></i>';
        break;
      default:
      break;
    }
    return HTML;
  }
});
