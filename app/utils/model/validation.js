/**
 * This function gets list of attributes on which user want to disable the validations and check if the current
 * attribute of the model is inside list of disabled attributes then it returns true otherwise false.
 * 
 * @method disableValidation
 * @returns boolean
 */
export function disableValidation() {
    let disabledAttributes = this.model['disableValidations'];
    return disabledAttributes
        ? disabledAttributes.includes(this.attribute)
        : false
}