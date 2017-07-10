/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import DS from "ember-data";

/**
 * This is the application serializer, we are using it to override some of the
 * naming conventions followed by EmberJs
 *
 * @class Application
 * @namespace Prometheus.Serializers
 * @extends DS.JSONAPISerializer
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.JSONAPISerializer.extend({

    /**
     * Setting the primary key as the field id
     *
     * @property primaryKey
     * @type string
     * @for Application
     * @protected
     */
    primaryKey: 'id',

    /**
     * By default EmberJS process the model name by pluralizing it, we want to
     * keep it as it is.
     *
     * @method modelNameFromPayloadKey
     * @param {String} modelName The model name
     * @return {String} modelName The model name as it is
     * @protected
     */
    modelNameFromPayloadKey :function(modelName){
        return modelName;
    },

    /**
     * By default EmberJS process the field name, we want to camelize it
     *
     * @method keyForAttribute
     * @param {String} key The key name
     * @return {String} key The key name camelized
     * @protected
     */
    keyForAttribute(key/*, method*/) {
        return Ember.String.camelize(key);
    },

    /**
     * Camelize the relationship key
     *
     * @method keyForRelationship
     * @param {String} key
     * @return {*}
     * @protected
     */
    keyForRelationship(key/*, typeClass, method)*/) {
        return Ember.String.camelize(key);
    },

});