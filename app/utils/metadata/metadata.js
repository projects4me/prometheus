/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

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
        "users":{
            "nav": true
        },
        "roles": {
            "nav": true
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
                    projectRelated: false,
                    order: 1
                },
                Project: {
                    label: 'views.nav.menu.project.label',
                    icon: 'briefcase',
                    route: 'app.projects',
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
                        }
                    },
                    order: 6
                },
                Issue:{
                    label: 'views.nav.menu.issue.label',
                    icon: 'tasks',
                    route: 'app.project.issue',
                    anchorRoute: 'issue',
                    projectRelated: true,
                    actions:{
                        section1:{
                            list:{
                                label: 'views.nav.menu.issue.list',
                                route: 'app.project.issue',
                                className: 'text-teal',
                                anchorRoute: 'issue',
                                projectRelated: true,
        
                            },
                            create:{
                                label: 'views.nav.menu.issue.create',
                                route: 'app.project.issue.create',
                                className: 'text-red',
                                anchorRoute: 'issue/create',
                                projectRelated: true,
        
                            }
                        }
                    },
                    order: 2                    
                },
                Idea:{
                    label: 'views.nav.menu.idea.label',
                    icon: 'lightbulb-o',
                    route: 'app.project.idea',
                    anchorRoute: 'idea',
                    projectRelated: true,
                    aclContext: 'idea.read',
                    order: 7
                },
                Conversation:{
                    label: 'views.nav.menu.conversation.label',
                    icon: 'comments',
                    route: 'app.project.conversation',
                    anchorRoute: 'conversations',
                    projectRelated: true,
                    order: 5
                },  
                Board:{
                    label: 'views.nav.menu.board.label',
                    icon: 'columns',
                    route: 'app.project.board',
                    anchorRoute: 'board',
                    projectRelated: true,
                    order: 3
                },
                Gantt:{
                    label: 'views.nav.menu.gantt.label',
                    icon: 'calendar',
                    route: 'app.project.gantt',
                    anchorRoute: 'gantt',
                    projectRelated: true,
                    order: 4
                }
            },
            adminItems: {
                Workflows: {
                    label: 'views.nav.menu.workflow.label',
                    icon: 'sitemap',
                    route: 'app.workflow',
                    anchorRoute: 'workflow',
                    aclContext: 'workflow.read',
                    projectRelated: false
                },
                Agents: {
                    label: 'global.module.plural.agent',
                    icon: 'android',
                    route: 'app.agent',
                    anchorRoute: 'agent',
                    aclContext: 'agent.read',
                    projectRelated: false,
                    actions: {
                        section1: {
                            list: {
                                label: 'views.nav.menu.agent.list',
                                route: 'app.agent',
                                className: 'text-teal',
                                anchorRoute: 'agent',
                                projectRelated: false,
                            },
                            create: {
                                label: 'views.nav.menu.agent.create',
                                route: 'app.agent.create',
                                className: 'text-red',
                                anchorRoute: 'agent/create',
                                projectRelated: false,
                                aclContext: 'agent.create',
                            },
                            tools: {
                                label: 'views.nav.menu.agent.tools',
                                route: 'app.agent.tools',
                                className: 'text-yellow',
                                anchorRoute: 'agent/tools',
                                projectRelated: false,
                                aclContext: 'agent.read',
                            },
                            skills: {
                                label: 'views.nav.menu.agent.skills',
                                route: 'app.agent.skills',
                                className: 'text-green',
                                anchorRoute: 'agent/skills',
                                projectRelated: false,
                                aclContext: 'agent.read',
                            }
                        }
                    }
                },
                Settings: {
                    label: 'views.nav.menu.settings.label',
                    icon: 'cogs',
                    route: 'app.settings',
                    anchorRoute: 'settings',
                    aclContext: 'setting.read',
                    projectRelated: false,
                },
                Developer: {
                    label: 'views.nav.menu.developer.label',
                    icon: 'code',
                    route: 'app.developer',
                    anchorRoute: 'developer',
                    aclContext: 'setting.read',
                    projectRelated: false,
                }
            },
            settingsItems: {
                access: {
                    label: 'views.nav.menu.settings.group.access',
                    items: {
                        Users: {
                            label: 'views.nav.menu.user.label',
                            icon: 'users',
                            route: 'app.settings.users',
                            aclContext: 'user.read'
                        },
                        Roles: {
                            label: 'views.nav.menu.role.label',
                            icon: 'key',
                            route: 'app.role',
                            aclContext: 'role.read'
                        }
                    }
                },
                projects: {
                    label: 'views.nav.menu.settings.group.projects',
                    items: {
                        IssueTypes: {
                            label: 'views.nav.menu.settings.issueTypes.label',
                            icon: 'tags',
                            route: 'app.settings.issue-types',
                            aclContext: 'setting.read'
                        },
                        IssueStatuses: {
                            label: 'views.nav.menu.settings.issueStatuses.label',
                            icon: 'flag',
                            route: 'app.settings.issue-statuses',
                            aclContext: 'setting.read'
                        }
                    }
                },
                system: {
                    label: 'views.nav.menu.settings.group.system',
                    items: {
                        Email: {
                            label: 'views.nav.menu.settings.email.label',
                            icon: 'envelope',
                            route: 'app.settings.email',
                            aclContext: 'setting.read'
                        },
                        Services: {
                            label: 'views.nav.menu.settings.services.label',
                            icon: 'plug',
                            route: 'app.settings.services',
                            aclContext: 'serviceclient.read'
                        }
                    }
                }
            }
        },
        Project:{
            search: {
                module: 'Project',
                textField: 'Project.name',
                fields: {
                    'Project.name': { label: 'views.app.project.filter.name', type: 'text', aliases: ['name'] },
                    'Project.shortCode': { label: 'views.app.project.filter.shortCode', type: 'text', aliases: ['code'] },
                    'Project.status': {
                        label: 'views.app.project.filter.status',
                        type: 'enum',
                        aliases: ['status'],
                        values: { source: 'translation', key: 'views.app.project.lists.status' }
                    },
                    'manager.name': {
                        label: 'views.app.project.filter.manager',
                        type: 'user',
                        aliases: ['manager'],
                        values: { source: 'users' }
                    }
                }
            },
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
            }
        },
        Agent: {
            search: {
                module: 'Agent',
                textField: 'Agent.name',
                fields: {
                    'Agent.name': { label: 'views.app.agent.list.name', type: 'text', aliases: ['name'] },
                    'Agent.purpose': { label: 'views.app.agent.list.purpose', type: 'text', aliases: ['purpose'] },
                    'sponsor.name': {
                        label: 'views.app.agent.list.sponsor',
                        type: 'user',
                        aliases: ['sponsor'],
                        values: { source: 'users' }
                    }
                }
            }
        },
        Workflow: {
            search: {
                module: 'Workflow',
                textField: 'Workflow.name',
                fields: {
                    'Workflow.name': { label: 'views.app.workflow.list.name', type: 'text', aliases: ['name'] },
                    'Workflow.description': { label: 'views.app.workflow.list.description', type: 'text', aliases: ['description'] },
                    'Workflow.status': {
                        label: 'views.app.workflow.fields.status',
                        type: 'enum',
                        aliases: ['status'],
                        values: { source: 'translation', key: 'views.app.workflow.status' }
                    }
                }
            }
        },
        Issue: {
            search: {
                module: 'Issue',
                textField: 'Issue.subject',
                fields: {
                    'Issue.issueNumber': { label: 'views.app.issue.fields.issueNumber', type: 'number', aliases: ['number', '#'] },
                    'Issue.subject': { label: 'views.app.issue.fields.subject', type: 'text', aliases: ['subject'] },
                    'Issue.status': {
                        label: 'views.app.issue.fields.status',
                        type: 'enum',
                        aliases: ['status'],
                        values: { source: 'issueStatuses' }
                    },
                    'issuemilestone.name': {
                        label: 'views.app.issue.fields.milestoneId',
                        type: 'enum',
                        aliases: ['milestone'],
                        values: { source: 'milestones' }
                    },
                    'issuetype.name': {
                        label: 'views.app.issue.fields.typeId',
                        type: 'enum',
                        aliases: ['type'],
                        values: { source: 'issueTypes' }
                    },
                    'Issue.priority': {
                        label: 'views.app.issue.fields.priority',
                        type: 'enum',
                        aliases: ['priority', 'prio'],
                        values: { source: 'translation', key: 'views.app.issue.lists.priority' }
                    },
                    'Issue.startDate': { label: 'views.app.issue.fields.startDate', type: 'date', aliases: ['start'] },
                    'Issue.endDate': { label: 'views.app.issue.fields.endDate', type: 'date', aliases: ['end'] },
                    'parentissue.issueNumber': { label: 'views.app.issue.fields.parent', type: 'number', aliases: ['parent'] },
                    'assignedTo.name': {
                        label: 'views.app.issue.fields.assignee',
                        type: 'user',
                        aliases: ['assignee'],
                        values: { source: 'members' }
                    },
                    'ownedBy.name': {
                        label: 'views.app.issue.fields.owner',
                        type: 'user',
                        aliases: ['owner'],
                        values: { source: 'members' }
                    },
                    'reportedBy.name': {
                        label: 'views.app.issue.fields.reportedBy',
                        type: 'user',
                        aliases: ['reporter'],
                        values: { source: 'members' }
                    }
                }
            }
        },
        TaskBoard: {
            search: {
                extends: 'Issue',
                exclude: ['issuemilestone.name'],
                excludeReason: 'views.app.board.searchExcludedMilestone'
            }
        },
        Idea: {
            search: {
                module: 'Idea',
                textField: 'Idea.title',
                fields: {
                    'Idea.title': { label: 'views.app.idea.fields.title', type: 'text', aliases: ['title'] },
                    'Idea.description': { label: 'views.app.idea.fields.descriptionLabel', type: 'text', aliases: ['description'] },
                    'Idea.status': {
                        label: 'views.app.idea.fields.status',
                        type: 'enum',
                        aliases: ['status'],
                        values: { source: 'translation', key: 'views.app.idea.status' }
                    },
                    'createdBy.name': {
                        label: 'views.app.idea.fields.creator',
                        type: 'user',
                        aliases: ['creator', 'author'],
                        values: { source: 'members' }
                    },
                    'Idea.dateCreated': { label: 'views.app.idea.fields.dateCreated', type: 'date', aliases: ['created'] },
                    'Idea.dateModified': { label: 'views.app.idea.fields.dateModified', type: 'date', aliases: ['updated'] }
                }
            }
        },
        Dashboard:{
            widgets: {
                recentIssues: {
                    model: 'issue',
                    options: {
                        query: "((Issue.projectId CONTAINS ```MY_PROJECTS```) AND (Issue.dateModified <: ```NOW```))",
                        rels : 'project',
                        sort: "Issue.dateModified",
                        order: 'DESC',
                        limit: 5
                    },
                    pageSize: 5,
                    fields: ['issueNumber', 'subject', 'status', {label: 'project', valueKey: 'project.name'}, 'startDate', 'endDate'],
                    translationKey: 'views.app.issue.fields',
                    searchFields: ['issueNumber', 'subject', 'project.name'],
                    useLazyLoading: true,
                    filters: ["assignedToMe", "inProgressIssues"]
                },
                activeMilestones: {
                    model: 'milestone',
                    options: {
                        query: "((Milestone.projectId CONTAINS ```MY_PROJECTS```) AND (Milestone.status : in_progress))",
                        rels : 'project',
                        sort: "Milestone.endDate",
                        order: 'DESC',
                        limit: 5
                    },
                    pageSize: 5,
                    fields: ['name', {label: 'project', valueKey: 'project.name'}, 'status', 'overview'],
                    translationKey: 'views.app.milestone.fields',
                    searchFields: ['name', 'project.name'],
                    useLazyLoading: true
                },
                weeklyActivities: {
                    model: 'activity',
                    options: {
                        query: "((Activity.dateCreated BETWEEN ```WEEK_START``` AND ```WEEK_END```) AND ((Activity.relatedTo : issue) OR (Activity.relatedTo : project)))",
                        sort: "Activity.dateCreated",
                        order: "DESC",
                        rels: 'project,issue',
                        limit: -1
                    },
                    fields: ['subject', 'createdUser', 'dateCreated'],
                    translationKey: 'views.app.activity.fields',
                    searchFields: ['subject', 'createdUser'],
                    useLazyLoading: true
                },
                weeklyIssueTimelogs: {
                    model: 'issue',
					options: {
						query: "((Issue.startDate <: ```WEEK_END```) AND (Issue.endDate >: ```WEEK_START```))",
						rels: 'spent,estimated',
                        sort: "Issue.dateModified",
                        order: 'DESC',
						limit: -1
					},
                    fields: ['issueNumber', 'subject', 'spent', 'estimated', 'status', 'project'],
                    translationKey: 'views.app.widgets.weeklyIssueTimelogs.fields',
                    usePagination: true,
                    searchFields: ['issue.issueNumber', 'issue.subject', 'projectShortcode'],
                    filters: ["myTimeLogs"]
                },
                weeklyConversations: {
                    model: 'comment',
                    options: {
                        sort: 'Comment.dateCreated',
                        query: "((Comment.dateCreated BETWEEN ```WEEK_START``` AND ```WEEK_END```) AND (Comment.relatedTo : conversationrooms))",
                        order: 'DESC',
                        rels: 'conversationRoom,issue',
                        limit: -1
                    },
                    fields: ['comment'],
                    translationKey: 'views.app.widgets.recentConversations.fields',
                    searchFields: ['comment'],
                    usePagination: true
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
     * system. Labels are translation keys; they are translated where they are shown.
     *
     * @method getViewMeta
     * @param {String} module  The module for which we have to retrieve the meta
     * @param {String} view The view of the module whose meta is required
     * @return {Object} metadata The requested metadata
     */
    getViewMeta:function(module,view){
        if (this.views[module] !== undefined && this.views[module][view] !== undefined)
        {
            let meta = this.views[module][view];
            return meta;
        }
        return false;
    }

});