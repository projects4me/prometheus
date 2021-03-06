/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import Object from '@ember/object';

/**
 * The meta is the main object storing the different types of metadata that the
 * application makes use of
 *
 * @class Metadata
 * @namespace Prometheus.Utils
 * @module Metadata
 * @extends Ember.Object
 * @author Hammad Hassan <gollomer@gmail.com>
 * @todo Allow the metadata to be retrived from the server
 */
export default Object.extend({

    /**
     * The list of modules in the system and their default behaviors
     *
     * @property modules
     * @type Object
     * @for Metadata
     * @private
     */
    modules:{
        "dashboard":{
            "nav": true,
        },
        "project":{
            "nav": true,
        },
        "issue":{
            "nav": true,
        },
        "conversation":{
            "nav": true,
        },
        "workflow":{
            "nav": true,
        },
        "report":{
            "nav": true,
        },
        "timelog":{
            "nav": true,
        },
        "calendar":{
            "nav": true,
        },
        "wiki":{
            "nav": true,
        }
    },

    /**
     * The metadata for the views in the sysetm. I want to built all the views via
     * metadata, this allow me to built very extendible views and application in
     * return.
     *
     * @property views
     * @type Object
     * @for Metadata
     * @private
     */
    views: {
        Navigation: {
            items: {
                Dashboard: {
                    label: 'views.nav.menu.dashboard.label',
                    icon: 'dashboard',
                    route: 'app',
                    anchorRoute: '',
                    routeParams: null,
                    projectRelated: false
                },
                Project: {
                    label: 'views.nav.menu.project.label',
                    icon: 'briefcase',
                    route: 'app.projectlist',
                    anchorRoute: 'project',
                    projectRelated: false,
                    actions: {
                        section1: {
                            list: {
                                label: 'views.nav.menu.project.list',
                                route: 'app.projects',
                                className: 'text-teal',
                                anchorRoute: 'project',
                                projectRelated: false,
                            },
                            create: {
                                label: 'views.nav.menu.project.create',
                                route: 'app.projects.create',
                                className: 'text-red',
                                anchorRoute: 'project/create',
                                projectRelated: false,
                            }
                        },
                        section2:{
                            import:{
                                label: 'views.nav.menu.project.import',
                                route: 'app.import',
                                anchorRoute: 'project/import',
                                projectRelated: false,
                            },
                            export:{
                                label: 'views.nav.menu.project.export',
                                route: 'app.export',
                                anchorRoute: 'project/export',
                                projectRelated: false,
                            }
                        }
                    }
                },
                Issue:{
                    label: 'views.nav.menu.issue.label',
                    icon: 'tasks',
                    route: 'app.project.issue',
                    anchorRoute: 'issue',
                    routeParams: {module: 'issue'},
                    projectRelated: true,
                    actions:{
                        section1:{
                            list:{
                                label: 'views.nav.menu.issue.list',
                                route: 'app.project.issue',
                                className: 'text-teal',
                                anchorRoute: 'issue',
                                projectRelated: true,
                                routeParams: {module: 'issue'}
                            },
                            create:{
                                label: 'views.nav.menu.issue.create',
                                route: 'app.project.issue.create',
                                className: 'text-red',
                                anchorRoute: 'issue/create',
                                projectRelated: true,
                                routeParams: {module: 'issue'}
                            }
                        },
                        section2:{
                            import:{
                                label: 'views.nav.menu.issue.import',
                                route: 'app.import',
                                anchorRoute: 'issue/import',
                                projectRelated: true,
                                routeParams: {module: 'issue'}
                            },
                            export:{
                                label: 'views.nav.menu.issue.export',
                                route: 'app.export',
                                anchorRoute: 'issue/export',
                                projectRelated: true,
                                routeParams: {module: 'issue'}
                            }
                        }
                    }
                },
                Conversation:{
                    label: 'views.nav.menu.conversation.label',
                    icon: 'comments',
                    route: 'app.project.conversation',
                    anchorRoute: 'conversation',
                    projectRelated: true,
                    routeParams: null
                },
                Board:{
                    label: 'views.nav.menu.board.label',
                    icon: 'columns',
                    route: 'app.project.board',
                    anchorRoute: 'board',
                    projectRelated: true,
                    routeParams: null
                },
                Workflow:{
                    label: 'views.nav.menu.workflow.label',
                    icon: 'puzzle-piece',
                    route: 'app.module',
                    anchorRoute: 'workflow',
                    routeParams: {module: 'workflow'},
                    projectRelated: false,
                    actions:{
                        section1:{
                            list:{
                                label: 'views.nav.menu.workflow.list',
                                route: 'app.module',
                                className: 'text-teal',
                                anchorRoute: 'workflow',
                                projectRelated: false,
                                routeParams: {module: 'workflow'}
                            },
                            create:{
                                label: 'views.nav.menu.workflow.create',
                                route: 'app.create',
                                className: 'text-red',
                                anchorRoute: 'workflow/create',
                                projectRelated: false,
                                routeParams: {module: 'workflow'}
                            }
                        },
                        section2:{
                            import:{
                                label: 'views.nav.menu.workflow.import',
                                route: 'app.import',
                                anchorRoute: 'workflow/import',
                                projectRelated: false,
                                routeParams: {module: 'workflow'}
                            },
                            export:{
                                label: 'views.nav.menu.workflow.export',
                                route: 'app.export',
                                anchorRoute: 'workflow/export',
                                projectRelated: false,
                                routeParams: {module: 'workflow'}
                            }
                        }
                    }
                },
                Report:{
                    label: 'views.nav.menu.report.label',
                    icon: 'bar-chart',
                    route: 'app.module',
                    anchorRoute: 'report',
                    routeParams: {module: 'report'},
                    projectRelated: false,
                    actions:{
                        section1:{
                            list:{
                                label: 'views.nav.menu.report.list',
                                route: 'app.module',
                                className: 'text-teal',
                                anchorRoute: 'report',
                                projectRelated: false,
                                routeParams: {module: 'report'}
                            },
                            create:{
                                label: 'views.nav.menu.report.create',
                                route: 'app.create',
                                className: 'text-red',
                                anchorRoute: 'report/create',
                                projectRelated: false,
                                routeParams: {module: 'report'}
                            }
                        },
                        section2:{
                            export:{
                                label: 'views.nav.menu.report.export',
                                route: 'app.export',
                                anchorRoute: 'report/export',
                                projectRelated: false,
                                routeParams: {module: 'report'}
                            }
                        }
                    }
                },
                Timelog:{
                    label: 'views.nav.menu.timelog.label',
                    icon: 'clock-o',
                    route: 'app.module',
                    anchorRoute: 'timelog',
                    routeParams: {module: 'timelog'},
                    projectRelated: false,
                    actions:{
                        section1:{
                            list:{
                                label: 'views.nav.menu.timelog.list',
                                route: 'app.module',
                                className:"text-teal",
                                anchorRoute: 'timelog',
                                projectRelated: false,
                                routeParams: {module: 'timelog'}
                            },
                            create:{
                                label: 'views.nav.menu.timelog.create',
                                route: 'app.create',
                                className: "text-red",
                                anchorRoute: 'timelog/create',
                                projectRelated: false,
                                routeParams: {module: 'timelog'}
                            }
                        },
                        section2:{
                            import:{
                                label: 'views.nav.menu.timelog.import',
                                route: 'app.import',
                                anchorRoute: 'timelog/import',
                                projectRelated: false,
                                routeParams: {module: 'timelog'}
                            },
                            export:{
                                label: 'views.nav.menu.timelog.export',
                                route: 'app.export',
                                anchorRoute: 'timelog/export',
                                projectRelated: false,
                                routeParams: {module: 'timelog'}
                            }
                        }
                    }
                },
                Calendar:{
                    label: 'views.nav.menu.calendar.label',
                    icon: 'calendar',
                    route: 'app.project.calendar',
                    anchorRoute: 'calendar',
                    projectRelated: true,
                    routeParams: null
                },
                Wiki:{
                    label: 'views.nav.menu.wiki.label',
                    icon: 'book',
                    route: 'app.project.wiki',
                    anchorRoute: 'wiki',
                    projectRelated: true,
                    routeParams: null
                }
            }
        },
        Project:{
            list: {
                fields:{
                    name:{
                        fieldName: 'name',
                        label: 'view.projects.list.name',
                        type: 'text',
                        sort:true,
                        sortPriority:1,
                        link:true,
                    },
                    shortCode:{
                        fieldName: 'shortCode',
                        type: 'text',
                        label: 'view.projects.list.shortcode',
                        sort:true,
                    },
                    dateCreated:{
                        fieldName: 'dateCreated',
                        type: 'datetime',
                        label: 'view.projects.list.dateCreated',
                        sort:true,
                    },
                    dateModified:{
                        fieldName: 'dateModified',
                        type: 'text',
                        label: 'view.projects.list.dateCreated',
                        sort:true,
                    },
                    notes:{
                        fieldName: 'notes',
                        type: 'textarea',
                        label: 'view.projects.list.notes',
                        sort:false,
                        length:50
                    }
                }
            },
            create:{
                buttons:{
                    inline: {
                        save:{
                            name:"save",
                            event:"onSave",
                            label:"global.form.save"
                        },
                        cancel:{
                            name:"cancel",
                            event:"onCancel",
                            label:"global.form.cancel"
                        }
                    },
                    dropdown: {
                        group1:{
                            findDuplicate:{
                                name:"findDuplicate",
                                event:"onFindDuplicate",
                                label:"global.form.findDuplicate"
                            },
                            findDuplicate2:{
                                name:"findDuplicate",
                                event:"onFindDuplicate",
                                label:"global.form.findDuplicate"
                            }

                        },
                        group2:{
                            findDuplicate:{
                                name:"findDuplicate",
                                event:"onFindDuplicate",
                                label:"global.form.findDuplicate"
                            }
                        }
                    }
                },
                sections:{
                    section1:{
                        label: 'view.projects.create.section1',
                        style: 'grid',
                        fields:{
                            name : {
                                fieldName: "name",
                                label: "view.projects.create.name",
                                size: 'col-xs-6',
                                type: 'text',
                                required: true,
                                errorMsg: 'view.projects.create.name.error',
                                filter:'text'
                            },
                            shortCode:{
                                fieldName: "shortCode",
                                label: "view.projects.create.shortcode",
                                size: 'col-xs-6',
                                type: 'text',
                                help: 'view.projects.create.shortcode.help',
                                required: true,
                                errorMsg: 'view.projects.create.shortcode.error',
                                filter:'alphanumeric'
                            },
                            type:{
                                fieldName: "type",
                                binding: "model.type",
                                label: "view.projects.create.type",
                                size: 'col-xs-6',
                                type: 'multienum',
                                required: true,
                                errorMsg: 'view.projects.create.type.error',
                                options:[
                                    {label: "Software", value: 'software'},
                                    {label: "Civil", value: 'civil'}
                                ]
                            },
                        }
                    }
                }
            },

            filters:{
                enabledFilters:[
                    {
                        id: 'Project.name',
                        label: "views.app.project.filter.name",
                        type: 'string'
                    },
                    {
                        id: 'Project.shortCode',
                        label: "views.app.project.filter.shortCode",
                        type: 'string',
                        operators: ['equal', 'not_equal', 'in', 'not_in', 'is_null', 'is_not_null','contains']
                    },
                    {
                        id: 'Project.type',
                        label: "views.app.project.filter.type",
                        type: 'integer',
                        input: 'select',
                        values: {
                            'scrum': 'Scrum',
                            'kanban': 'Kanban',
                            'business': 'Business',
                            'other': 'Other',
                        },
                        operators: ['equal']
                    },
                    {
                        id: 'Project.status',
                        label: "views.app.project.filter.status",
                        type: 'integer',
                        input: 'select',
                        values: {
                            'new': 'New',
                            'in_progress': 'In Progress',
                            'pending': 'Pending',
                            'completed': 'Completed',
                            'closed': 'Closed',
                            'deferred': 'Deferred',
                        },
                        operators: ['equal']
                    },
                    // {
                    //   id: 'Project.phoneField',
                    //   label: "views.app.project.filter.phoneField",
                    //   type: 'string',
                    //   placeholder: '____-____-____',
                    //   operators: ['equal', 'not_equal'],
                    //   validation: {
                    //     format: /^.\({3}\).{3}-.{3}$/
                    //   }
                    // }
                ]
            }
        },
        Issue:{
            filters:{
                enabledFilters:[
                    {
                        id: 'Issue.issueNumber',
                        label: "views.app.issue.filter.issueNumber",
                        type: 'string'
                    },
                    {
                        id: 'Issue.subject',
                        label: "views.app.issue.filter.subject",
                        type: 'string',
                        operators: ['equal', 'not_equal', 'in', 'not_in', 'is_null', 'is_not_null','contains']
                    },
                    {
                        id: 'Issue.status',
                        label: "views.app.issue.filter.status",
                        type: 'integer',
                        input: 'select',
                        values: {
                            'new': 'New',
                            'in_progress': 'In Progress',
                            'done': 'Done',
                            'pending': 'Pending',
                            'feedback': 'Feedback',
                            'deferred': 'Deferred',
                        },
                        operators: ['equal']
                    },
                    {
                        id: 'Issue.priority',
                        label: "views.app.issue.filter.priority",
                        type: 'integer',
                        input: 'select',
                        values: {
                            'blocker': 'Blocker',
                            'critical': 'Critical',
                            'high': 'High',
                            'medium': 'Medium',
                            'low': 'Low',
                            'lowest': 'Lowest'
                        },
                        operators: ['equal']
                    },
                    {
                        id: 'Issue.startDate',
                        label: "views.app.issue.filter.startDate",
                        type: 'date',
                        input: "text",
                        operators: ['equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between', 'not_between'],
                        plugin: 'datepicker',
                        plugin_config: {
                            todayBtn: 'linked',
                            todayHighlight: true,
                            autoclose: true
                        }
                    },
                    {
                        id: 'Issue.endDate',
                        label: "views.app.issue.filter.endDate",
                        type: 'date',
                        input: "text",
                        operators: ['equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between', 'not_between'],
                        plugin: 'datepicker',
                        plugin_config: {
                            todayBtn: 'linked',
                            todayHighlight: true,
                            autoclose: true
                        }
                    },
                ]
            }
        },
        Dashboard:{
            widgets: {
                issuesToday: {
                    /**
                     * @example
                     *      ``` javascript
                     *      options: {
                     *          fields: "Project.id,Project.name",
                     *          query: "(Project.id : "+projectId+")",
                     *          rels : 'members',
                     *          sort: "conversations.dateModified",
                     *          order: 'ASC',
                     *          limit: -1
                     *      }
                     *      ```
                     */
                    model: 'issue',
                    options: {
//                        query: "((Issue.dateModified BETWEEN ```TODAY_START``` AND ```TODAY_END```) AND (Issue.assignee : ```ME```))",
                        query: "((Issue.assignee : ```ME```) AND ((Issue.startDate BETWEEN ```TODAY_START``` AND ```TODAY_END``` ) OR (Issue.status : in_progress)))",
                        rels : 'createdBy,modifiedBy,project',
                        sort: "Issue.dateModified",
                        order: 'ASC',
                        limit: -1
                    }
                },
                weeklyMilestones: {
                    model: 'milestone',
                    options: {
                        query: "((Milestone.projectId CONTAINS ```MY_PROJECTS```) AND (Milestone.endDate BETWEEN ```WEEK_START``` AND ```WEEK_END```))",
                        rels : 'issues',
                        sort: "issues.dateModified",
                        order: 'ASC',
                        limit: -1
                    }
                }

            }
        }
    },

    /**
     * This variable store the business logic for the system, although the basic
     * application behavior would be hard coded and would not work through the
     * definitions in this object. However, hard coding the business logic
     * makes us compromise the flexibility that we would otherwise have. This
     * is where the businessLogic meta comes into play, this logic will be
     * executed by the application and thus would allow us to extend the
     * application behavior. All good but this is complex so will come later :)
     *
     * @property businessLogic
     * @type Object
     * @for Metadata
     * @private
     * @todo Yet to be implemented :D
     */
    businessLogic:{},

    /**
     * This function is used to retrieve the metadata for the different views in the
     * system. The function has the capability of translating the labels as well
     *
     * @method getViewMeta
     * @param {String} module  The module for which we have to retrieve the meta
     * @param {String} view The view of the module whose meta is required
     * @param {Object} i18n The object for the internationalization library
     * @return {Object} metadata The requested metadata
     */
    getViewMeta:function(module,view,i18n){
        if (this.views[module] !== undefined && this.views[module][view] !== undefined)
        {
            let meta = this.views[module][view];
            if (view === 'filters')
            {
                _.forEach(meta.enabledFilters,function(value){
                    let label = i18n.t(value.label);
                    if (label.string !== undefined){
                        value.label = label.string;
                    }
                });
            }
            return meta;
        }
        return false;
    }

});