import getRequestData from "../helpers/parse-request";
import Collection from 'ember-cli-mirage/orm/collection';

export function register(server, ctx) {
    server.post('/timelog', (schema, request) => {
        let requestData = getRequestData(request);
        let timelog = server.create('timelog', requestData.attributes);
        _setIssueTimeLog(timelog);
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