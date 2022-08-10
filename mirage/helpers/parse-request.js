/**
 * This function returns data that User has posted.
 * 
 * @param {Object} request 
 * @returns Object
 */
 export default function getRequestData(request) {
    return JSON.parse(request.requestBody).data;
}