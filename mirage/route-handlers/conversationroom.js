import getRequestData from "../helpers/parse-request";

export function register(server, ctx) {
    server.get('/conversationroom', (schema, request) => {
        return schema.conversationrooms.all();
    });

    server.get('/conversations', (schema, request) => {
        return schema.conversationrooms.all();
    });

    server.post('/conversationroom', (schema, request) => {
        let requestData = getRequestData(request);
        let conversationRoom = server.create('conversationroom', requestData.attributes);
        return conversationRoom;
    });
}