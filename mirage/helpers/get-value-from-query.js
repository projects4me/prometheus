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
        let operators = "(AND|OR|BETWEEN|:|<|>|<:|>:|CONTAINS|STARTS|ENDS|NULL|EMPTY)"
        const regex = new RegExp(`\\((${field}\\s+${operators})\\s+([^)]+)\\)`);
        const match = query.match(regex);
        if (match) {
            return match[3];
        }
    }
}