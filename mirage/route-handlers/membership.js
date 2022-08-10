import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    server.post('membership', (schema, request) => {
        let requestData = getRequestData(request);
        let membership = server.create('membership', requestData.attributes);
        return membership
    });
}