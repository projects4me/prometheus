import { Response } from "miragejs";
import getRequestData from "../helpers/parse-request";
import { Collection } from 'miragejs';

export function register(server, ctx) {

    server.get('/timelog', (schema, request) => {
        let model = schema.timelogs.all();
        if(ctx.get('customCallback')) {
            return ctx.get('customCallback')(model);
        }
        return model;
    });

    server.post('/timelog', (schema, request) => {
        let requestData = getRequestData(request);
        let timelog = server.create('timelog', requestData.attributes);
        _setIssueTimeLog(timelog);
        return timelog;
    });

    server.patch('/timelog/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let timelog = schema.timelogs.find(request.params.id);
        if (!timelog) {
            return new Response(404, {}, { error: 'Timelog not found' });
        }
        timelog.update(requestData.attributes);
        return timelog;
    });
}


/**
 * This function set timelog relationship on issue.
 * 
 * @param timelog 
 */
 function _setIssueTimeLog(timelog) {
    let timelogs = new Collection('timelog');
    timelogs.models.pushObject(timelog);
    let issue = server.schema.issues.find(timelog.issueId);
    let relName = (timelog.context === "spent") ? "spent" : "estimated"

    issue.update({
        [relName]: timelogs
    });
}