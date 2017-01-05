/**
 * This utility provide data validation for the fields in the sysetm
 */
export default {
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
    _validateAlphaNumeric:function(value){
      var regexValidate = /^[a-z0-9]+$/ig;
      var regexFilter = /[^a-z0-9]/ig;
      return this._validate(value,regexValidate,regexFilter);
    },
    /**
     * This function peroforms the actual validation, if the value is not
     * valid then the filter is performed
     * @todo allow disabling of filter
     * @param string value
     * @param regex regexValidate
     * @param regex regexFilter
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
