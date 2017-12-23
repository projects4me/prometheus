/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * This utility provide data validation for the fields in the system
 *
 * @class Fields
 * @namespace Prometheus.Utils
 * @module Validator
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default {

    /**
     * This function is used to validate the value for a field
     *
     * @method validate
     * @param {String} fieldType
     * @param {*} value
     * @param {String} regex
     * @return {*}
     * @public
     */
    validate:function(fieldType,value,regex){
      if (regex !== undefined)
      {
          // perform custom validation
          // regex.validate
          // regex.filter
          return true;
      }
      else if (fieldType === 'text'){
        return this._validateText(value);
      }
      else if (fieldType === 'alphanumeric'){
        return this._validateAlphaNumeric(value);
      }
      else if (fieldType === 'phone'){
        return this._validatePhone(value);
      }
      return false;
    },

    /**
     * This function is used to validate text type fields
     *
     * @method _validateText
     * @param {String} value
     * @return {*}
     * @private
     */
    _validateText:function(value)
    {
      var regexValidate = /^[a-z0-9 ]+$/ig;
      var regexFilter = /[^a-z0-9 ]/ig;
      if (value.match(regexValidate))
      {
        return true;
      }
      else {
        return value.replace(regexFilter,'');
      }
    },

    /**
     * This function is used to validate phone type fields
     *
     * @method _validatePhone
     * @param {String} value
     * @return {*}
     * @private
     */
    _validatePhone:function(value)
    {
      var regexValidate = /^[a-z0-9 ]+$/ig;
      var regexFilter = /[^a-z0-9 ]/ig;
      if (value.match(regexValidate))
      {
        return true;
      }
      else {
        return value.replace(regexFilter,'');
      }
    },

    /**
     * This function is used to validate the format for alpha numeric fields
     *
     * @method _validateAlphaNumeric
     * @param {String} value
     * @return {*}
     * @private
     */
    _validateAlphaNumeric:function(value){
      var regexValidate = /^[a-z0-9]+$/ig;
      var regexFilter = /[^a-z0-9]/ig;
      return this._validate(value,regexValidate,regexFilter);
    },

    /**
     * This function peroforms the actual validation, if the value is not
     * valid then the filter is performed
     *
     * @method _validate
     * @param {String} value
     * @param {Regex} regexValidate
     * @param {Regex} regexFilter
     * @return {*}
     * @todo allow disabling of filter
     */
    _validate:function(value,regexValidate,regexFilter){
      if (value.match(regexValidate)) {
        return true;
      }
      else {
        return value.replace(regexFilter,'');
      }
    }

};