import Ember from "ember";
import FormField from "../components/form-fields";

/**
  This is the checkbox field component.

  @class FieldTextComponent
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
  type: "text",

  /**
    The char length

    @property
    @type String
    @for FieldTextComponent
    @protected
  */
  charLength: Ember.computed('value', function() {
    return (this.get('value'));
  }),
});
