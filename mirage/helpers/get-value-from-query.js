/**
 * This function is used to extract the value of specific field
 * from query params.
 * 
 * @param {String} field 
 * @param {String} query 
 * @returns String
 */
 export default function getValueFromQuery(field, query) {
    if (query != undefined) {
        let matchQueryField = new RegExp(`(${field} : (\\d+))`);
        if (matchQueryField.exec(query)) {
            let regex = /(^:)|[\d]/;
            let val = regex.exec(query);
            return val[0];
        }
    }
}