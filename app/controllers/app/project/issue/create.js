/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { inject as controller } from '@ember/controller';
import { computed, action } from '@ember/object';
import format from "prometheus/utils/data/format";
import _ from "lodash";
import { htmlSafe } from '@ember/template';

/**
 * This is the controller for issue create page
 *
 * @class AppProjectIssueCreateController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusCreateController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssueCreateController extends PrometheusCreateController.extend(ProjectRelated) {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppProjectIssueCreateController
     * @protected
     */
    metadata = {
        sections: [
            {
                name: "issueCreate",
                fields: [
                    {
                        name: "subject",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "typeId",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "assignee",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "owner",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "statusId",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "priority",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "startDate",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "endDate",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    },
                                    {
                                        name: "test",
                                        value: [
                                            'end-date-greater-than-start-date',
                                            this.intl.t(
                                                'views.app.issue.create.validations.endDateGreaterThanStartDate'
                                            ),
                                            function(value) {
                                                const endDate = new Date(value);
                                                const startDate = new Date(this.parent.startDate);
                                                return endDate > startDate;
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }

    /**
     * This function is called on the initialization of the controller. In this function
     * we're calling setupSchema method in order to generate schema, by analyzing metadata
     * defined in the controller, that will be used to validate the form of the template.
     *
     * @method constructor
     * @public
     */    
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * This is the module for which we are trying to create
     *
     * @property module
     * @type String
     * @for Create
     * @protected
     */
    module = 'issue';

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    @controller('app') appController;

    /**
     * This milestones available for this project
     *
     * @property milestoneList
     * @type Array
     * @for Create
     * @public
     */
    @computed('project.milestones')
    get milestoneList() {
        let milestones = this.project.milestones.sortBy('dateCreated').reverse();
        return (new format(this)).getSelectList(milestones, false, htmlSafe(this.intl.t('global.blank')).toHTML());
    }

    /**
     * This issue types available for the project
     *
     * @property typeList
     * @type Array
     * @for Create
     * @public
     */
    @computed('types')
    get typeList() {
        return (new format(this)).getSelectList(this.types);
    }

    /**
     * This issue statuses available for the project
     *
     * @property issueStatusList
     * @type Array
     * @for Create
     * @public
     */
    @computed('statuses')
    get issueStatusList() {
        return (new format(this)).getTranslatedModelList(this.statuses, 'views.app.issue.lists.status');
    }

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    @computed('appController.usersList')
    get usersList() {
        return this.appController.get('usersList');
    }

    /**
     * This estimates for this issue
     *
     * @property estimates
     * @type Array
     * @for Create
     * @private
     */
    estimates = [];

    /**
     * This function sets the model properties before saving it
     *
     * @method beforeSave
     * @param model
     */
    beforeSave(model) {
        model.set('reportedUser', this.currentUser.user.id);
        model.set('startDate', moment(model.get('startDate')).format("YYYY-MM-DD"));
        model.set('endDate', moment(model.get('endDate')).format("YYYY-MM-DD"));
    }

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return htmlSafe(this.intl.t('views.app.issue.created', {
            name: model.get('subject'),
            issueNumber: model.get('issueNumber')
        }));
    }

    /**
     * This function navigate a user to the issue detail page
     *
     * @method navigateToSuccess
     * @param model
     */
    navigateToSuccess(model) {
        this.transitionToRoute('app.project.issue.page', model.get('issueNumber'));
    }

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model) {
        return (_.size(model.changedAttributes()) > 2);
    }

    /**
     * This function navigates a use to the issue list view.
     *
     * @method afterCancel
     * @param projectId
     * @protected
     */
    afterCancel() {
        this.transitionToRoute('app.project.issue', {  shortcode: this.trackedProject.shortCode });
    }

    /**
     * This function is used to allow search on both the issues name and
     * the issue number
     *
     * @method parentMatcher
     * @param issue
     * @param term
     * @return {Number}
     */
    parentMatcher(issue, term) {
        return `#${issue.number} - ${issue.name}`.toLowerCase().indexOf(term);
    }

    /**
     * This function is used to set the parent for the issue
     *
     * @param model
     * @param field
     * @param target
     */
    @action changedParent(model, field, target) {
        model.set(field, target.id);
    }
}
