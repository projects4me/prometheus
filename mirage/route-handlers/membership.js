import getValueFromQuery from '../helpers/get-value-from-query';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    server.get('/membership', (schema, request) => {
        let memberships = schema.memberships.all();
        let query = request.queryParams.query;
        let fieldName = ctx.get('requestQuery')?.membership;
        let value = getValueFromQuery(fieldName, query);

        if (fieldName) {
            memberships = schema.memberships.where({ [fieldName]: value });
        }
        return memberships;
    });

    server.post('membership', (schema, request) => {
        let requestData = getRequestData(request);
        let membership = server.create('membership', requestData.attributes);
        return membership
    });
}