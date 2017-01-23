//import Ember from "ember";
import FormField from "../components/form-fields";

/**
  This is the checkbox field component.

  @class FieldCheckboxComponent
  @extends FormFieldComponent
  @author Hammad Hassan <gollomer@gmail.com>
*/
export default FormField.extend({

  /**
    The type of the field, this is added here so that we can have major
    functionality in the form-fields component and only extend what is required

    @property
    @type String
    @for FieldTextComponent
    @protected
  */
  type: "checkbox",

  /**
    Set the empty state for the checkbox field
    
    @method setEmpty
    @protected
  */
  setEmpty:function(){
    var isEmpty = false;
    const value = this.get('value');

    if (this.get('oldValue') === null) {
      if (value === undefined) {
        this.set('value',false);
        this.set('oldValue',false);
      }
      else {
        this.set('oldValue',value);
      }
    }

    if (value === null || value === undefined) {
        isEmpty = true;
    }
    else {
      if (value === false) {
        isEmpty = true;
      }
    }
    this.set('isEmpty',isEmpty);
  }


});
