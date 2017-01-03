import Ember from "ember";
import _ from "lodash";

/**
  This component is used to render different activity blocks for the system
  There is only one component and it points to differnt tempalate dynamically
  based on the input parameters

  @class ActivityBlockComponent
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
    We need the compoent to render inside an li so that the UI does not break
  */
  tagName: "li",

  /**
    This is the layout name that determines the HBS file to be rendered, we are
    using this so that we can created dynamic activty blockes without having to
    check for the type using if else statements that can be very taxing as the
    number of activities in the system can grow and comparing the type against
    each possible combination can be very taxing
  */
  layoutName: function() {
    var activity = this.get('activity');
    var template = null;

    var createdSince = moment.duration(moment(new Date()).diff(moment(activity.get('dateCreated')))).humanize();
    Ember.set(activity,"createdSince",createdSince);


    if (activity.get('type') === 'related'){
      template = 'components/activity-blocks/related-'+activity.get('relatedActivity');
    }
    else {
      template = 'components/activity-blocks/'+activity.get('type');
    }

    if (Prometheus.__container__.lookup('template:'+template) === undefined) {
      template = 'components/activity-blocks/index';
    }

    return template;
  }.property('activity','model').volatile(),


});
