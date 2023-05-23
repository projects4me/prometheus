/**
 * This function is used to sort the array of model on the basis of given sort key, order and datatype of sort.
 * 
 * @param {String} sort 
 * @param {String} order 
 * @param {Array} model 
 * @param {String} sortDataType The data type of the property to be sorted e.g string, number and string with numbers.
 * @returns Array
 */
export default function sortModel(sort, order = 'asc', model, sortDataType) {
    if (!_.isEmpty(sort)) {
        let attribute = sort.split('.').pop();
        order = order.toLowerCase();
        let sortStringCb = (a, b) => {
            return (order === 'desc')
                ? b[attribute].localeCompare(a[attribute])
                : a[attribute].localeCompare(b[attribute])
        };

        let sortNumberCb = (a, b) => {
            return (order === 'desc')
                ? b[attribute] - a[attribute]
                : a[attribute] - b[attribute];
        }

        let sortStringWithNumberCb = (a, b) => {
            return order === 'desc'
                ? (Number(b[attribute].match(/(\d+)/g)[0]) - Number((a[attribute].match(/(\d+)/g)[0])))
                : (Number(a[attribute].match(/(\d+)/g)[0]) - Number((b[attribute].match(/(\d+)/g)[0])))
        }

        if (sortDataType === 'string') {
            return model.sort(sortStringCb);
        } else if (sortDataType === 'number') {
            return model.sort(sortNumberCb)
        } else if (sortDataType === 'stringWithNumber') {
            return model.sort(sortStringWithNumberCb);
        }

    }
    return model;
}