import * as Yup from 'yup';

/**
 * This function generates the yup schema dynamically based on the provided metadata.
 * 
 * @method generateSchemaFromMeta
 * @param {Object} metadata 
 * @returns {Array} Array of schemas
 */
export default function generateSchemaFromMeta(metadata) {
    let schemas = [];

    metadata.sections.forEach((section) => {
        let innerSchema = {};
        section.fields.forEach((field) => {
            let validationType = field.validations.default.type;
            let validationRules = field.validations.default.rules;

            innerSchema[field.name] = Yup[validationType]();

            validationRules?.forEach((rule) => {
                innerSchema[field.name] = innerSchema[field.name][rule.name](rule.value);
            });

        });

        //create yup object for each section
        schemas[section.name] = Yup.object().shape(innerSchema);
    });

    return schemas;
}