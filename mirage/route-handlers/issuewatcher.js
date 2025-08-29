/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

export function register(server, ctx) {
    server.post('/issuewatcher', (schema, request) => {
        let requestData = JSON.parse(request.requestBody).data;
        let issueWatcher = server.create('issuewatcher');
        
        issueWatcher.update(requestData.attributes);
        let customCallback = ctx.get('customCallback');
        if(customCallback) {
            return customCallback(issueWatcher);
        }
        
        return issueWatcher;
    });

    server.patch('/issuewatcher/:id', (schema, request) => {
        let requestData = JSON.parse(request.requestBody).data;
        let issueWatcher = schema.issuewatchers.find(requestData.id);
        issueWatcher.update(requestData.attributes);
        return issueWatcher;
    });
}
