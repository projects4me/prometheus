import Ember from "ember";
import Validator from  "../utils/validator/fields";

/**
 * This class allows us to render different fields according to the field type
 * specified in the meta data definition for the view
 */
export default Ember.Component.extend({
  /**
    Normally you just specify a string value in the layoutName but in order
    to support dynamic behavior we are declaring a function and setting it as
    volatile so that Ember attempts to get the layoutName at run time every time.
  */
  layoutName: function() {
    var type = this.get('definition').type;
    var view = this.get('view');

    var template = 'components/field/'+type+'/'+view;
    if (Prometheus.__container__.lookup('template:'+template) === undefined) {
      template = 'components/field/text/'+view;
    }
    return template;
  }.property('view','definition','model').volatile(),

   /**
    * Perform some actions after the render is complete
    * @todo perhaps delegate the did render per type
    */
    didRender: function() {
      var definition = this.get('definition');

      // Apply input mask
      if (definition.mask !== undefined && definition.mask !== '' && definition.tagName !== undefined && definition.tagName !== '') {

        var options = {
/*          onInvalid: function(val, e, f, invalid, options){
            //element.blinkError();
            //var error = invalid[0];
            console.log ("Digit: ", error.v, " is invalid for the position: ", error.p, ". We expect something like: ", error.e);
          }*/
        };

        if (definition.maskTranslation !== undefined && definition.maskTranslation !== '') {
          options.translation = definition.maskTranslation;
        }

        Ember.$('#'+this.elementId+' '+definition.tagName).mask(definition.mask,options);
      }

      /**
       * @todo fix multi enum
       * @todo on apply update model for date field
       */

      if (definition.type === 'enum' || definition.type === 'multienum') {
        Ember.$('#'+this.elementId+' select').selectpicker();
      }
      else if (definition.type === 'date') {
        Ember.$('#'+this.elementId+' input').daterangepicker({
          singleDatePicker: true,
          showDropdowns: true,
          locale: {
            format: 'MMMM D, YYYY'
          }
        });
      }
      else if (definition.type === 'datetime') {
        Ember.$('#'+this.elementId+' input').daterangepicker({
          singleDatePicker: true,
          timePicker: true,
          showDropdowns: true,
          locale: {
            format: 'MMMM D, YYYY  h:mm A'
          }
        });
      }
      else if (definition.type === 'email') {
        Ember.$('#'+this.elementId+' input').mask("A", {
        	translation: {
        		"A": { pattern: /[\w@\-.+]/, recursive: true }
        	}
        });
      }

    },

   /**
    * Add the calss fieldSize to every feild element in order to allow easy
    * control of the field size.
    */
   classNameBindings: ['fieldSize'],

   /**
    * Leverage the fieldSize attribute supported by Emberjs and make it a runtime
    * dynamic property.
    */
   fieldSize: function() {
     return this.get('definition').size;
   }.property('definition').volatile(),

   /**
    * This is a utility function that is used to display the error message above
    * the field and add a blink effect on the input to highlight error.
    *
    * @param void
    * @todo get the display time from the application configuration
    */
   blinkError: function(){
     console.log('blink called');
     // Add class to hightlight the border of the field
     Ember.$('#'+this.elementId+' [name='+(this.get('definition').fieldName+']')).addClass('highlight-error');

     // Remove the hidden class from the error message in order to display the error message
     Ember.$('#'+this.elementId+' .field-error').removeClass('hidden');

     // Remove the class from the element in to revert it to normal after 0.5 seconds
     setTimeout(function(_element) {
       Ember.$('#'+_element.elementId+' [name='+(_element.get('definition').fieldName)+']').removeClass('highlight-error');
      }, 500,this);

      /**
       * @todo clear the previous timeout
       */
      // Add the hidden class in the error message tag to hide it from display after 1.5 seconds
      setTimeout(function(_element) {
        Ember.$('#'+_element.elementId+' .field-error').addClass('hidden');
      }, 1500,this);
   },

   actions:{
     /**
      * This function is called whenever a value is changed in the field
      * this function validates the data and displays error message if the data
      * input is not valid for the type specified in the metadata for the view
      *
      * @todo at the moment the meta key used for field validation is 'filter', verify if that will be used instead of the 'type'
      * @todo implement field masking in order to support better user experience
      */
     changed:function(value){
       console.log('Value changed to '+value);
       var result = true;
       var validationFailure = false;
       var filter = this.get('definition.filter');
       // If the valu entered is not empty then validate the data type
       if (value !== null && value !== '') {
         if (filter !== null && filter !== '' && filter !== undefined)
         {
           result = Validator.validate(filter,value);
         }
         if (result === true)
         {
           return this.set('model.'+(this.get('definition').fieldName),value);
         }
         else
         {
           // set the error flag to true so that the error can be displayed
           validationFailure = true;
           /**
            * @todo see if there is a better way to set the value, this method takes more time then direct observe.
            */
          if (this.childViews[0] !== undefined) {
           this.childViews[0].set('value',result);
          }
         }
       } // check if the field is required if so then display error
       else {
         var required = this.get('definition.required');
         if (required === true){
           validationFailure = true;
         }
       }

       // If there was an error message then display it
       if(validationFailure === true){
         this.blinkError();
       }
     },

     /**
      This action is triggerd when a user tries to navigate to the deatil view

      @method detail
      @param id {String} the identifier of the module
      @return void
      @todo Forward the action to the controller
      @public

     navigate:function(module,id){
       this.sendAction('detail');
       //console.log(this);
       //var URIData = navi.buildURL(Ember.String.camelize(module),'detail',{id:id});
       //this.transitionToRoute(URIData.route,URIData.options);
     },*/
   }
});
