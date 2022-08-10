import getRequestData from "../helpers/parse-request";
import pushObjectInModel from "../helpers/push-object-in-model";
import getValueFromQuery from "../helpers/get-value-from-query";

export function register(server, ctx) {
    server.get('/issue', (schema, request) => {
        let model = schema.issues.all();
        let issueQuery = request.queryParams.query;
        let issueNumber = getValueFromQuery('Issue.issueNumber', issueQuery);
        let customIssues = server['customIssues'];

        if (issueNumber) {
            pushObjectInModel(model, schema.issues.find(issueNumber));
        } else if (issueQuery.indexOf("savedsearch") >= 0) {
            pushObjectInModel(model, schema.issues.find(1));
        } else if (customIssues) {
            model = customIssues();
        }
        return model;
    });

    server.get('/issue/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issues.find(id);
    });

    server.patch('/issue/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let issue = schema.issues.find(requestData.id);
        issue.update(requestData.attributes);
        return issue;
    });

    server.post('/issue', (schema, request) => {
        let requestData = JSON.parse(request.requestBody).data;
        let issue = server.create('issue');

        /*updating issue twicely because of first getting default issueNumber
        * and setting it to requested attributes and then updating the
        * issue again
        */
        requestData.attributes["issueNumber"] = issue.issueNumber;
        issue.update(requestData.attributes);
        issue.update({
            issuetype: schema.issuetypes.find(requestData.attributes.typeId),
            status: schema.issuestatuses.find(issue.statusId).name
        });
        ctx.set('latestCreatedIssue', issue);
        return issue;
    });
}