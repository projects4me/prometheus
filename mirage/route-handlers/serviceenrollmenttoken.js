import getRequestData from '../helpers/parse-request';

export function register(server) {
    server.get('/serviceenrollmenttoken', (schema) => {
        return schema.serviceenrollmenttokens.all();
    });

    // Gaia returns the secret token only in the response that creates it.
    server.post('/serviceenrollmenttoken', (schema, request) => {
        let { name, kind } = getRequestData(request).attributes;
        let record = server.create('serviceenrollmenttoken', { name, kind });
        let json = record.toJSON();
        return { data: { type: 'serviceenrollmenttoken', id: json.id, attributes: { name, kind, expiresAt: json.expiresAt, usedAt: null, token: `secret-${json.id}` } } };
    });

    server.delete('/serviceenrollmenttoken/:id', (schema, request) => {
        let token = schema.serviceenrollmenttokens.find(request.params.id);
        token.destroy();
        return token;
    });
}
