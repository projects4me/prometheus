import _ from "lodash";
import Context from './yadda-context/context';
import ENV from "prometheus/config/environment";
import Collection from 'ember-cli-mirage/orm/collection';

export default function () {
    this.urlPrefix = ENV.api.host;
    this.namespace = 'api/v' + ENV.api.version;
    this.timing = 0;
    let ctx = new Context();

    this.get('/user', (schema, request) => {
        let model = schema.users.all();
        let userQuery = request.queryParams.query;
        let id = _getValueFromQuery(`User.id`, userQuery);
        if (id) {
            _pushObjectInModel(model, schema.users.find(id));
        }
        return model;
    });

    this.get('/user/:id', (schema, request) => {
        let id = request.params.id;
        if (id === "me") {
            id = ctx.get('currentUser').id
        }
        let model = schema.users.find(id);
        return model;
    });

    this.get('/issue', (schema, request) => {
        let model = schema.issues.all();
        let issueQuery = request.queryParams.query;
        let issueNumber = _getValueFromQuery('Issue.issueNumber', issueQuery);
        let customIssues = server['customIssues'];

        if (issueNumber) {
            _pushObjectInModel(model, schema.issues.find(issueNumber));
        } else if (issueQuery.indexOf("savedsearch") >= 0) {
            _pushObjectInModel(model, schema.issues.find(1));
        } else if (customIssues) {
            model = customIssues();
        }
        return model;
    });

    this.get('/issue/:id', (schema, request) => {
        let id = request.params.id;
        return {
            data: {
                type: 'issue',
                id: id,
                attributes: schema.issues.find(id),
                relationships: {
                    assignedTo: {
                        data: {
                            type: "user",
                            id: id
                        }
                    },
                    createdBy: {
                        data: {
                            type: "user",
                            id: id
                        }
                    },
                    modifiedBy: {
                        data: {
                            type: "user",
                            id: id
                        }
                    },
                    ownedBy: {
                        data: {
                            type: "user",
                            id: id
                        }
                    },
                    reportedBy: {
                        data: {
                            type: "user",
                            id: id
                        }
                    },
                    project: {
                        data: {
                            type: "project",
                            id: id
                        }
                    },
                    milestone: {
                        data: {
                            type: "milestone",
                            id: id
                        }
                    },
                    issuetype: {
                        data: {
                            type: "issuetype",
                            id: id
                        }
                    }
                }
            },
            included: [
                {
                    type: 'user',
                    id: id,
                    attributes: schema.users.find(id).attrs,
                },
                {
                    type: 'project',
                    id: id,
                    attributes: schema.projects.find(id).attrs,
                },
                {
                    type: 'milestone',
                    id: id,
                    attributes: schema.milestones.find(id).attrs,
                },
                {
                    type: 'issuetype',
                    id: id,
                    attributes: schema.issuetypes.find(id).attrs,
                }
            ]
        };
    });

    this.get('/role', (schema) => {
        let data = schema.roles.all();
        let count = 1;
        let model = { data: [] };
        _.each(data.models, function (obj) {
            model.data.push({
                type: 'role',
                id: count++,
                attributes: obj.attrs
            });
        });
        return model;
    });

    this.get('/milestone', (schema) => {
        let model = schema.milestones.all();
        return model;
    });

    this.get('/project', (schema, request) => {
        let model = schema.projects.all();

        //check if queryParams have a query object or not
        let projectQuery = request.queryParams.query;

        //if user has requested a saved search then return one project
        if (projectQuery.indexOf("savedsearch") >= 0) {
            _pushObjectInModel(model, schema.projects.find(1));
        }

        return model;
    });

    this.get('/project/:id', (schema, request) => {
        let id = request.params.id;
        return schema.projects.find(id);
    });

    this.get('/issuetype', (schema, request) => {
        return schema.issuetypes.all();
    });

    this.get('/issuetype/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuetypes.find(id);
    });

    this.get('/activity', (schema) => {
        return schema.activities.all();
    });

    this.get('/dashboard/:id', (schema, request) => {
        let id = request.params.id;
        return schema.dashboards.find(id);
    });

    this.get('/issuestatus', (schema, request) => {
        return schema.issuestatuses.all();
    });

    this.get('/issuestatus/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuestatuses.find(id);
    });

    this.get('/savedsearch', (schema) => {
        return schema.savedsearches.all();
    });

    this.get('conversationroom', (schema, request) => {
        return schema.conversationrooms.all();
    });

    this.get('conversations', (schema, request) => {
        return schema.conversationrooms.all();
    });

    this.get('/milestone/:id', (schema, request) => {
        let id = request.params.id;
        return schema.milestones.find(id);
    });

    // patch requests
    this.patch('/issue/:id', (schema, request) => {
        let requestData = _getRequestData(request);
        let issue = schema.issues.find(requestData.id);
        issue.update(requestData.attributes);
        return issue;
    });

    this.patch('/project/:id', (schema, request) => {
        let requestData = _getRequestData(request);
        let project = schema.projects.find(requestData.id);
        project.update(requestData.attributes);
        return project;
    });

    //post requests
    this.post('/issue', (schema, request) => {
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

    this.post('/project', (schema, request) => {
        let requestData = _getRequestData(request);
        let project = server.create('project', requestData.attributes);
        ctx.set('latestCreatedProject', project);
        return project;
    });

    this.post('/issuetype', (schema, request) => {
        return server.schema.issuetypes.all();
    });

    this.post('conversationroom', (schema, request) => {
        let requestData = _getRequestData(request);
        let conversationRoom = server.create('conversationroom', requestData.attributes);
        return conversationRoom;
    });

    this.post('comment', (schema, request) => {
        let requestData = _getRequestData(request);
        let comment = server.create('comment', requestData.attributes);
        let currentUser = ctx.get('currentUser');

        comment.update({
            createdUser: currentUser.id,
            createdUserName: currentUser.name
        });
        return comment;
    });

    this.post('/token', (schema, request) => {
        let req = _.chain(request.requestBody).split('&').map(_.partial(_.split, _, '=', 2)).fromPairs().value();

        if (req.username === "hammad" && req.password === "hammad") {
            return {
                "access_token": "8ad7fdaaf7cc550174dd7070e697404eff7e5c50",
                "expires_in": 3600,
                "token_type": "Bearer",
                "scope": "application",
                "refresh_token": "30b8da05c69274dbfc4a71e36927d1e5698c7a45"
            }
        } else {
            return {
                "error": "invalid_grant",
                "error_description": "Invalid username and password combination"
            }
        }
    });

    this.post('membership', (schema, request) => {
        let requestData = _getRequestData(request);
        let membership = server.create('membership', requestData.attributes);
        return membership
    });

    this.post('timelog', (schema, request) => {
        let requestData = _getRequestData(request);
        let timelog = server.create('timelog', requestData.attributes);
        _setIssueTimeLog(timelog);
        return timelog;
    });
}

/**
 * This function is used to extract the value of specific field
 * from query params.
 * 
 * @param {String} field 
 * @param {String} query 
 * @returns String
 */
function _getValueFromQuery(field, query) {
    if (query != undefined) {
        let matchQueryField = new RegExp(`(${field} : (\\d+))`);
        if (matchQueryField.exec(query)) {
            let regex = /(^:)|[\d]/;
            let val = regex.exec(query);
            return val[0];
        }
    }
}

/**
 * This function push object into model.
 * 
 * @param {Object} model 
 * @param {Object} object
 * @returns object
 */
function _pushObjectInModel(model, object) {
    model.models.length = 0;
    model.models.pushObject(object);
}


/**
 * This function returns data that User has posted.
 * 
 * @param {Object} request 
 * @returns Object
 */
function _getRequestData(request) {
    return JSON.parse(request.requestBody).data;
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