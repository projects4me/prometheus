import _ from "lodash";

export default function() {
    this.urlPrefix = 'http://projects4me';
    this.namespace = '/api/v1';
    this.timing = 0;

    this.get('/user', (schema) => {
        let data =  schema.users.all();
        let count = 1;
        let model =  { data: []};
        _.each(data.models,function(obj){
            model.data.push({
                type: 'User',
                id: count++,
                attributes: obj.attrs
            });
        });
        return model;
    });

    this.get('/user/:id', (schema, request) => {
        // debugger;
        let id = request.params.id;
        if (id === "me"){
            id = 1;
        }

        let data = {
            data: {
                type: 'User',
                id: id,
                attributes: schema.users.find(id).attrs,
                relationships: {
                    dashboard: {
                        data: {
                            type: "dashboard",
                            id: id
                        }
                    }
                }
            },
            included:[
                {
                    type: 'dashboard',
                    id: id,
                    attributes: schema.dashboards.find(id).attrs,
                }
            ]
        };
        if(_.has(server, 'customUser')){
            data = server.customUser(schema,request)
        }
        return data;
    });

    this.get('/issue', (schema) => {
        let data =  schema.issues.all();
        let count = 1;
        let id = 1;
        let model =  { data: [], included: []};
        _.each(data.models,function(obj){
            model.data.push({
                type: 'issue',
                id: count++,
                attributes: obj.attrs,
                relationships: {
                    assignedTo: {
                        data:{
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
            });
        });

        model.included = [
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
        ];

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
                        data:{
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
            included : [
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

    this.post('/issue', (schema) => {
        Logger.debug("Create Issue");
        let id = 1;
        return {
            data: {
                type: 'issue',
                id: id,
                attributes: schema.issues.find(id),
                relationships: {
                    assignedTo: {
                        data:{
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
            included : [
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
        let data =  schema.roles.all();
        let count = 1;
        let model =  { data: []};
        _.each(data.models,function(obj){
            model.data.push({
                type: 'role',
                id: count++,
                attributes: obj.attrs
            });
        });
        return model;
    });

    this.get('/milestone', (schema) => {
        let data =  schema.milestones.all();
        let count = 1;
        let model =  { data: []};
        _.each(data.models,function(obj){
            model.data.push({
                type: 'milestone',
                id: count++,
                attributes: obj.attrs
            });
        });
        return model;
    });

    this.get('/project', (schema, request) => {
        let model =  schema.projects.all();
        let queryParams = request.queryParams.query;
        
        if(_.has(server, 'customDataProject')){
            server.customDataProject(schema,request)
        }
        if (queryParams == "(Project.id : 3)") {
            let projectId = queryParams.replace(/\)/g, "").replace(/^\D+/g, "");
            model = { data : []};
            let data = schema.projects.find(projectId);
            model.data.push({data , type: "project", id: "3"});
            return model;
        }
        return model;
    });

    this.get('/project/:id', (schema, request) => {
        let id = request.params.id;
        // debugger;
        // let data = {
        //     data: {
        //         type: 'project',
        //         id: id,
        //         attributes: schema.projects.find(id).attrs,
        //         relationships: {
        //             members: {
        //                 data: [
        //                     {
        //                         type: "user",
        //                         id: id
        //                     }
        //                 ]
        //             },
        //             memberships: {
        //                 data: [
        //                     {
        //                         type: "membership",
        //                         id: id
        //                     }
        //                 ]
        //             },
        //             milestones: {
        //                 data: [
        //                     {
        //                         type: "milestone",
        //                         id: id
        //                     }
        //                 ]
        //             },
        //             issuetypes: {
        //                 data: [
        //                     {
        //                         type: "issuetype",
        //                         id: id
        //                     }
        //                 ]
        //             },
        //             roles: {
        //                 data: [
        //                     {
        //                         type: "role",
        //                         id: id
        //                     }
        //                 ]
        //             }
        //         }
        //     },
        //     included:[
        //         {
        //             type: 'user',
        //             id: id,
        //             attributes: schema.users.find(id).attrs,
        //         },
        //         {
        //             type: 'membership',
        //             id: id,
        //             attributes: schema.memberships.find(id).attrs,
        //         },
        //         {
        //             type: 'milestone',
        //             id: id,
        //             attributes: schema.milestones.find(id).attrs,
        //         },
        //         {
        //             type: 'issuetype',
        //             id: id,
        //             attributes: schema.issuetypes.find(id).attrs,
        //         },
        //         {
        //             type: 'role',
        //             id: id,
        //             attributes: schema.roles.find(id).attrs,
        //         },
        //     ]
        // };
        // debugger
        // return data;
        // debugger;
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

}
