import steps from '../steps';

export const given = function () {
    return [
        {
            "User fetch $modelName against $field": (assert, ctx) => async function (modelName, field) {
                ctx.set('requestQuery', {
                    [modelName]: field
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}