/**
 * This function gets list of attributes on which user want to disable the validations and check if the current
 * attribute of the model is inside list of disabled attributes then it returns true otherwise false.
 * 
 * @method disableValidation
 * @returns boolean
 */
export default function disableValidation() {
    let disabledAttributes = this.get('model')['disableValidations'];
    return disabledAttributes
        ? disabledAttributes.includes(this.attribute)
        : false
}