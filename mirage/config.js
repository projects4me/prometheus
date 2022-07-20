import _ from "lodash";
import Context from './yadda-context/context';
import ENV from "prometheus/config/environment";

export default function () {
    this.urlPrefix = ENV.api.host;
    this.namespace = 'api/v'+ENV.api.version;
    this.timing = 0;
    let ctx = new Context();

    this.get('/user', (schema, request) => {
        let model = schema.users.all();
        let queryParams = request.queryParams.query;
        let id = getValueFromQuery(`User.id`, queryParams);
        if (id) {
            model.models.length = 0;
            model.models.pushObject(schema.users.find(id));
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
        let queryParams = request.queryParams.query;
        let issueNumber = getValueFromQuery('Issue.issueNumber', queryParams);
        if (issueNumber) {
            model.models.length = 0;
            model.models.pushObject(schema.issues.find(issueNumber));
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

    this.post('/issue', (schema, request) => {
        let requestData = JSON.parse(request.requestBody).data;
        let issue = server.create('issue');
        requestData.attributes["issueNumber"] = issue.issueNumber;
        issue.update(requestData.attributes);
        issue.update({
            issuetype: schema.issuetypes.find(requestData.attributes.typeId)
        });
        ctx.set('latestCreatedIssue', issue);
        return issue;
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

    this.get('/project', (schema) => {
        let model = schema.projects.all();
        return model;
    });

    this.get('/project/:id', (schema, request) => {
        let id = request.params.id;
        return schema.projects.find(id)
    });

    this.get('/issuetype/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuetypes.find(id)
    });

    this.get('/activity', (schema) => {
        return schema.activities.all();
    });

    this.get('/dashboard/:id', (schema, request) => {
        let id = request.params.id;
        return schema.dashboards.find(id);
    });

    this.get('/issuestatus/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuestatuses.find(id);
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

    this.patch('/issue/:id', (schema, request) => {
        let requestData = JSON.parse(request.requestBody).data;
        let issue = schema.issues.find(requestData.id);
        issue.update({
            status: requestData.attributes.status,
            milestoneId: requestData.attributes.milestoneId
        });
        return issue;
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
let getValueFromQuery = (field, query) => {
    if (query != undefined) {
        let matchQueryField = new RegExp(`(${field} : (\\d+))`);
        if (matchQueryField.exec(query)) {
            let regex = /(^:)|[\d]/;
            let val = regex.exec(query);
            return val[0];
        }
    }
}