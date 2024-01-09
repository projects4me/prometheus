import steps from '../steps';

export const then = function () {
    return [
        {
            "$modelName $fieldName of type $elementType value is $value": (assert) => async function (modelName, fieldName, elementType, value) {
                let assertionCallBack = {
                    input: 'hasValue',
                    textarea: 'hasValue',
                }

                let elSelector = `[data-field="${modelName.toLowerCase()}.${fieldName}"] ${elementType}`;
                assert.dom(elSelector)[assertionCallBack[elementType]](value);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}