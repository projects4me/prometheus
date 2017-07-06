/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

export default Ember.Controller.extend({
  someValue:'asdfasd',
  actions: {
    changed:function(currentValue){
      console.log('-------');
      console.log(currentValue);
    },
    onSave:function() {
      // validate the data
        // validate the required fields
        // validate the format
        // validate dependencies
      // var metaData = this.get('metaData');
      //console.log(metaData);
      //console.log(_);
      // var model = this.get('model');
      //console.log(metaData);
      // _.forEach(metaData.sections, function(value, key) {
        //console.log(key);
      // });

      // var sections = _.chain(metaData.sections).map(function(_el){
      //   return _el.fields;
      // });

      // var section2 = _.flatten(metaData.sections).map(function(_el){
        //console.log(_el);
      // });
      //model.set('notes','These are all test projects');
      //console.log('model element');
      //console.log(model);
      //model.save();
    }
  }
});
