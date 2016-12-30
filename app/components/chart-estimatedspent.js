import Ember from "ember";
import _ from "lodash";

/**
  This component is used to render the issue ratio chart in the application

  @class ChartEstimatedspentComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for ChartIssueratioComponent
   @private
  */
  i18n: Ember.inject.service(),

  /**
    These are the classes the must be registered with the component

    @property classNames
    @type Array
    @for ChartIssueratioComponent
    @private
  */
  classNames: ["chart-estimatedspent"],

  /**
    These are the attributes that are bound with the element

    @property attributeBindings
    @type Array
    @for ChartIssueratioComponent
    @private
  */
  attributeBindings: ["width","height"],

  /**
    The tag name of this component

    @property tagName
    @type Bool
    @for ChartIssueratioComponent
    @private
  */
	tagName: 'canvas',

  /**
    This function is called when the object is created, we are using this
    function to translate the emojis

    @method init
  */
  init:function(){
    this._super(...arguments);
  },

  /**
    This function is called after the component has been rendered, this is where
    we initiate the chart

    @method didRender
  */
  didRender:function(){
    var self = this;
    var issues = this.get('issues');

    if (issues !== undefined){
      Logger.debug('Lets get some lines');
      var estimatedspent = new Chart(self.get('element'),{
        type: 'line',
        data: self.getDatasets(issues),
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
      });

      self.set('estimatedspent',estimatedspent);
    }
  },

  getDatasets:function(issues){
    var self = this;
    var data = {
      labels:[],
      datasets:[{
        data:[],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };
    /*
    var statuses = issues.getEach('status');
    var count = 0;
    var ch = new ColorHash();

    _.forEach(statuses,function(status){
      data.labels[count] = self.get('i18n').t("view.app.issue.lists.status."+status).string;
      data.datasets[0].data[count] = issues.filterBy('status',status).length;

      var color = ch.rgb(data.labels[count]);
      data.datasets[0].backgroundColor[count] = 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.8)';
      data.datasets[0].borderColor[count] = 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.8)';
      count++;
    });*/
    data['datasets'][0].data = [{
        x: -10,
        y: 0
    }, {
        x: 0,
        y: 10
    }, {
        x: 10,
        y: 5
    }];

    return data;
  },

  willDestroyElement:function(){
    this.get('estimatedspent').destroy();
  }

});
