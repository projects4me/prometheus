import getRequestData from '../helpers/parse-request';

export function register(server) {
    server.get('/serviceenrollment', (schema) => {
        return schema.serviceenrollments.all();
    });

    // Gaia only accepts a change of the status.
    server.patch('/serviceenrollment/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let enrollment = schema.serviceenrollments.find(request.params.id);
        enrollment.update({ status: requestData.attributes.status });
        return enrollment;
    });
}
