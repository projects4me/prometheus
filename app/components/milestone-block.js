import Ember from "ember";
import _ from "lodash";

/**
  This component is used to render different milestone blocks for the system
  There is only one component and it points to differnt tempalate dynamically
  based on the input parameters

  @class MilestoneBlockComponent
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
    This is the layout name that determines the HBS file to be rendered, we are
    using this so that we can load milestone block dynamically without having to
    check for the type using if else statements that can be very taxing

    @property layoutName
    @private
  */
  layoutName: function() {
    var milestone = this.get('milestone');
    var status = milestone.get('status');
    var progress = 0;
    var template = null;

    // Calculate the progres
    if (milestone.get('issues.length') > 0)
    {
      var closed = 0;
      closed += milestone.get('issues').filterBy('status','done').length;
      closed += milestone.get('issues').filterBy('status','complete').length;
      closed += milestone.get('issues').filterBy('status','closed').length;
      closed += milestone.get('issues').filterBy('status','deferred').length;
      progress = _.round((closed/milestone.get('issues.length')) * 100);
    }

    // Set the milestone progress
    milestone.set('progress',progress);

    // Set the translated status
    milestone.set('status',this.get('i18n').t('view.app.milestone.lists.status.'+status));

    // Check if milestone is overdue
    if (status === 'in_progress' || status === 'planned')
    {
      if (moment().isSameOrAfter(milestone.get('endDate')))
      {
          status = 'overdue';
      }
    }

    // Set the template name
    template = 'components/milestone-blocks/'+status;

    if (Prometheus.__container__.lookup('template:'+template) === undefined) {
      template = 'components/milestone-blocks/index';
    }

    return template;
  }.property('milestone','model').volatile(),

  didInsertElement:function(){
    Ember.$('#'+this.elementId+' [data-toggle="popover"]').popover();
  },
  willDestroyElement:function(){
    Ember.$('#'+this.elementId+' [data-toggle="popover"]').popover('destroy');
  }

});
