import getRequestData from "../helpers/parse-request";
import Context from "../yadda-context/context";

export function register(server, ctx) {
    server.get('/conversationroom', (schema, request) => {
        let ctx = new Context();
        let model = schema.conversationrooms.all();
        let customCallback = ctx.get('cbConversationRoom');
        if (customCallback) {
            return customCallback(model);
        }
        return model;
    });

    server.post('/conversationroom', (schema, request) => {
        let requestData = getRequestData(request);
        let conversationRoom = server.create('conversationroom', requestData.attributes);
        return conversationRoom;
    });

    server.patch('/conversationroom/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let conversationRoom = schema.conversationrooms.find(requestData.id);
        conversationRoom.update(requestData.attributes);
        return conversationRoom;
    });
}