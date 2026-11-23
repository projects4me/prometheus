import getRequestData from "../helpers/parse-request";
import pushObjectInModel from "../helpers/push-object-in-model";
import getValueFromQuery from "../helpers/get-value-from-query";
import paginate from '../helpers/paginate';

export function register(server, ctx) {
    server.get('/issue', (schema, request) => {
        let model = schema.issues.all();
        let issueQuery = request.queryParams.query;
        // Let the steps assert what the list sent; Mirage still doesn't filter by it.
        ctx.set('lastIssueQuery', issueQuery);
        ctx.set('issueQueries', [...(ctx.get('issueQueries') || []), issueQuery]);
        let assigneeMatch = !ctx.get('fieldSearched') && (issueQuery || '').match(/Issue\.assignee : (\d+)\) AND \(Issue\.projectId : (\d+)/);
        if (assigneeMatch) {
            // The issues a person has in a project, as the Remove member dialog asks for them
            return paginate(schema.issues.where((issue) => String(issue.assignee) === assigneeMatch[1] && String(issue.projectId) === assigneeMatch[2]), request.queryParams);
        }
        let idOrList = [...(issueQuery || '').matchAll(/\(Issue\.id : (\d+)\)/g)].map((found) => found[1]);
        if (request.queryParams.rels === 'assignedTo' && idOrList.length) {
            // The linked-issues box reads the assignees of a level of issues by id
            return schema.issues.where((issue) => idOrList.includes(String(issue.id)));
        }
        let workspaceMatch = (issueQuery || '').match(/\(project\.workspaceId : ([^)\s]+)\)/);
        let scopedProjects = workspaceMatch
            ? schema.projects.where({ workspaceId: workspaceMatch[1] }).models.map((project) => String(project.id))
            : [...(issueQuery || '').matchAll(/\(Issue\.projectId : (\d+)\)/g)].map((found) => found[1]);
        let excludedList = (issueQuery || '').match(/\(Issue\.id !CONTAINS ([^)]+)\)/);
        let excludedIds = excludedList
            ? [...excludedList[1].matchAll(/'([^']*)'/g)].map((found) => found[1])
            : [...(issueQuery || '').matchAll(/\(Issue\.id !: (\d+)\)/g)].map((found) => found[1]);
        if ((scopedProjects.length || workspaceMatch) && excludedIds.length) {
            // The Link issues modal searches the issues of a workspace's projects without the issues it excludes
            let text = ((issueQuery || '').match(/Issue\.subject CONTAINS ([^)]+)\)/) || [])[1];
            let found = schema.issues
                .where((issue) => scopedProjects.includes(String(issue.projectId)) && !excludedIds.includes(String(issue.id)))
                .filter((issue) => !text || String(issue.subject).toLowerCase().includes(text.replace(/['"]/g, '').toLowerCase()))
                .sort((a, b) => String(b.dateModified || '').localeCompare(String(a.dateModified || '')));
            return paginate(found, request.queryParams);
        }
        let field = ctx.get('fieldSearched');
        field = field ? field : 'Issue.issueNumber';
        let value = getValueFromQuery(field, issueQuery);

        /**
         * First IF will work for global search where user searched an issue using field "subject"
         * instead of issueNumber. e.g "Issue.subject CONTAINS VALUE".
         */
        let idList = (issueQuery || '').match(/Issue\.id CONTAINS ([^)]+)/);
        if (idList) {
            // The global search reads its matched issues by id
            let ids = [...idList[1].matchAll(/'([^']*)'/g)].map((found) => found[1]);
            model = schema.issues.where((issue) => ids.includes(String(issue.id)));
        } else if (isNaN(value) && value !== undefined && field == 'Issue.issueSubject') {
            model = schema.issues.where({subject: value});
        } else if(value) {
            pushObjectInModel(model, schema.issues.find(value));
        } else if (issueQuery.indexOf("savedsearch") >= 0) {
            pushObjectInModel(model, schema.issues.find(1));
        }

        if(ctx.get(`paginateIssues`)) {
            const paginatedModels = paginate(model, request.queryParams);
            return paginatedModels;
        }

        if(ctx.get('customCallback')) {
            return ctx.get('customCallback')(model, request);
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

        // Check for statusId and update status name
        if (requestData.attributes.statusId) {
            const statusRecord = schema.issuestatuses.find(requestData.attributes.statusId);
            if (statusRecord) {
                issue.update({
                    status: statusRecord.name
                });
            }
        }
        
        if(ctx.get('customCallback')) {
            return ctx.get('customCallback')(issue);
        }        
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
        setIssueAttributes(schema, issue, requestData.attributes);

        let customCallback = ctx.get('customCallback');
        if(customCallback) {
            return customCallback(issue);
        }
        
        ctx.set('latestCreatedIssue', issue);
        return issue;
    });

    server.delete('/issue/:id', (schema, request) => {
        let id = request.params.id;
        let issue = schema.issues.find(id);
        issue.destroy();
        return issue;
    });

    function setIssueAttributes(schema, issue, attributes) {
        issue.update(attributes);
        issue.update({
            issuetype: schema.issuetypes.find(attributes.typeId),
            status: schema.issuestatuses.find(issue.statusId).name,
        });
        // Gaia derives assignedTo from the assignee id. Returning it unlinked would overwrite the
        // assignedTo the app set locally (ember-data:deprecate-relationship-remote-update-clearing-local-state).
        if (attributes.assignee) {
            issue.update({
                assignedTo: schema.users.find(attributes.assignee)
            });
        }
        if(attributes.parentId) {
            issue.update({
                parentissue: schema.issues.find(attributes.parentId)
            });
        }
    }
}