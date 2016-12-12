/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import DS from "ember-data";

/**
  This is the application serializer, we are using it to override some of the
  naming conventions followed by EmberJs

  @class ApplicationSerializer
  @extends DS.JSONAPISerializer
  @author Hammad Hassan gollomer@gmail.com
*/
export default DS.JSONAPISerializer.extend({
  /**
    Setting the primary key as the field id

    @property primaryKey
    @type string
    @for ApplicationSerializer
    @protected
  */
  primaryKey: 'id',

  /**
    By default EmberJS process the model name by pluralizing it, we want to
    keep it as it is.

    @method modelNameFromPayloadKey
    @param modelName {String} The model name
    @return modelName {String} The model name as it is
    @protected
  */
  modelNameFromPayloadKey :function(modelName){
      return modelName;
  },

  /**
    By default EmberJS process the field name, we want to camelize it

    @method keyForAttribute
    @param key {String} The key name
    @return key {String} The key name camelized
    @protected
  */
  keyForAttribute(key/*, method*/) {
    return Ember.String.camelize(key);
  },
});
