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
            let validationCb = field.validations.default.cb;
            let validationTests = field.validations.tests;

            innerSchema[field.name] = Yup[validationType](validationCb);

            validationRules?.forEach((rule) => {
                let args = rule.value ? rule.value : [];
                innerSchema[field.name] = innerSchema[field.name][rule.name](...args);
            });

            if (validationTests) {
                let tests = Array.isArray(validationTests)
                    ? validationTests
                    : [validationTests];

                tests.forEach((test) => {
                    innerSchema[field.name] = innerSchema[field.name].test(
                        test.name,
                        test.message,
                        async function (value) {
                            if (!value) return true;

                            try {
                                return await test.action(value);
                            } catch (error) {
                                return this.createError({
                                    message: error.message ?? test.message
                                });
                            }
                        }
                    );
                });
            }
        });

        schemas[section.name] = Yup.object().shape(innerSchema);
    });

    return schemas;
}