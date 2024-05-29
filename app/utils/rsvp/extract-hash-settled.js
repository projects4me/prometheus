/**
 * This function extract data of the promises which are settled by using hashSettled method of Route. After extracting data
 * we prepare an nested object which contains only relevant information ({key: data}), not the state of the promise and rejection
 * reason (if promise is rejected). If the main module( ARG "moduleName") promise is rejected then we'll throw the reason of the
 * rejection upwards and if all of the promises are fulfilled then this will eventually prepare a nested object return that.
 * 
 * @method extractHashSettled
 * @param {Object} data Object that contains the state, value and reason of rejection (if rejected) of Promise.
 * @returns {String} Main module name.
 */
export default function (data, moduleName = null) {
    return Object.entries(data).reduce((model, [modelKey, modelValue]) => {
        if (modelValue.state === 'rejected' && modelKey === moduleName) {
            throw modelValue.reason;
        }
        model[modelKey] = (modelValue.value) ?? [];
        return model;
    }, {});
}