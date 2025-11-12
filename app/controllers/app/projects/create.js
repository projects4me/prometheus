/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import format from '../../../utils/data/format';
import { inject as controller } from '@ember/controller';
import { computed, action } from '@ember/object';
import { hash } from 'rsvp';
import _ from 'lodash';
import { htmlSafe } from '@ember/template';

/**
 * This is empty controller, normally we do not create them. However
 * Ember's inject in the child controllers was failing on reload
 * when this controller did not exist. Apparently Ember.inject.controller
 * does not work on run time generated controllers in case of page reload
 *
 * @class AppProjectsCreateController
 * @namespace Prometheus.Controllers
 * @module App.Projects
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectsCreateController extends PrometheusCreateController {
	/**
	 * This object holds all of the information that we need to create our schema and also need to
	 * render the template (in future).
	 * @property metadata
	 * @type Object
	 * @for AppProjectsCreateController
	 * @protected
	 */
	metadata = {
		sections: [
			{
				name: 'projectCreate',
				fields: [
					{
						name: 'name',
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'shortCode',
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'type',
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'hasIssuetypes',
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'projectManager',
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'status',
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					}										
				]
			}
		]
	};

    /**
     * This flag is used to show the field information.
     * 
     * @property showFieldInfo
     * @type Boolean
     * @for Create
     */
    showFieldInfo = true;	

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
	module = 'project';

	/**
	 * We are pre-loading the project issues and the users in the
	 * system when a use navigates to the project view. Inside the
	 * this page we are simply fetching the information stored in
	 * the project controller. For that purpose we are loading injecting
	 * the project controller controller inside this controller.
	 *
	 * @property projectController
	 * @type Prometheus.Controllers
	 * @for Create
	 * @private
	 */
	@controller('app') appController;

	/**
	 * This is a computed property in which gets the list of users
	 * in the system loaded by the project controller
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
	 * This is a computed property that generated the project short
	 * code automatically based on the project name
	 *
	 * @property shortCode
	 * @type String
	 * @for Create
	 * @public
	 * @todo optimize the short code generation algorithm to reduce conflicts
	 */
	@computed('model.name')
	get shortCode() {
		let name = '';
		if (this.model !== undefined && this.model.name !== undefined) {
			name = this.model.name;
		}
		let shortCode = name.replace(/[^a-zA-Z]+/g, '');
		shortCode = shortCode.slice(0, 5).toUpperCase();

		return shortCode;
	}

	/**
	 * This is a computed property in which gets the list of issue
	 * types in the system
	 *
	 * @property issuetypeList
	 * @type Array
	 * @for Create
	 * @private
	 */
	@computed('issuetypes')
	get issuetypeList() {
		return new format(this).getSelectList(this.issuetypes);
	}

	/**
	 * This is a computed property in which gets the list of issue
	 * statuses in the system
	 *
	 * @property issueStatusList
	 * @type Array
	 * @for Create
	 * @private
	 */
	@computed('issueStatuses')
	get issueStatusList() {
		return new format(this).getTranslatedModelList(
			this.issueStatuses,
			'views.app.issue.lists.status'
		);
	}

	/**
	 * This function sets the short code for the project.
	 *
	 * @method beforeValidate
	 * @param model
	 * @protected
	 */
	beforeValidate(model) {
		model.set('shortCode', this.shortCode);
		if (
			!(
				this.selectedIssuetypes != undefined &&
				this.selectedIssuetypes.length > 0
			)
		) {
			model.set('hasIssuetypes', '');
		} else {
			model.set('hasIssuetypes', true);
		}
	}

	/**
	 * This function sets the model properties before saving it
	 *
	 * @method beforeSave
	 * @param model
	 */
	beforeSave(model) {
		model.set('deleted', '0');
		model.set(
			'startDate',
			moment(model.get('startDate')).format('YYYY-MM-DD')
		);
		model.set('endDate', moment(model.get('endDate')).format('YYYY-MM-DD'));
	}

	/**
	 * This function associates the selected issue type with the project
	 *
	 * @method afterSave
	 * @param model
	 */
	afterSave(model) {
		let _self = this;
		let selectedIssuetypes = _self.get('selectedIssuetypes');
		let Promises = {};

		_.forEach(selectedIssuetypes, function (issueType) {
			let newIssueType = _self.get('store').createRecord('issuetype', {
				name: issueType.label,
				deleted: 0,
				description: issueType.label,
				system: 0,
				projectId: model.get('id')
			});
			Promises[issueType.label] = newIssueType.save();
		});
		return hash(Promises);
	}

	/**
	 * This function returns the success message
	 *
	 * @method getSuccessMessage
	 * @param model
	 */
	getSuccessMessage(model) {
		return htmlSafe(
			this.intl.t('views.app.project.created', {
				name: model.get('name')
			})
		);
	}

	/**
	 * This function navigate a user to the project detail page
	 *
	 * @method navigateToSuccess
	 * @param model
	 */
	navigateToSuccess(model) {
		if(this.model.projectManager === this.currentUser.user.id) {
			this.transitionToRoute('app.project', model.shortCode.toLowerCase());
		} else {
			this.transitionToRoute('app.projects.index');
		}
	}

	/**
	 * This function checks if a field has changed
	 *
	 * @method _save
	 * @param model
	 * @protected
	 */
	hasChanged(model) {
		return _.size(model.changedAttributes()) > 1;
	}

	/**
	 * This function navigates a use to the issue list view.
	 *
	 * @method afterCancel
	 * @param projectId
	 * @protected
	 */
	afterCancel() {
		this.transitionToRoute('app.projects');
	}

	/**
	 * This function searches the issue types based on the term provided by the user and also
	 * includes the term in the list of issue types to make user selects the term as well.
	 *
	 * @method searchIssueTypes
	 * @param term
	 * @returns {Array} filteredIssueTypes
	 */
	@action searchIssueTypes(term) {
		let filteredIssueTypes = this.issuetypeList.filter((issuetype) => {
			let type = issuetype.label.toLowerCase();
			if (type.includes(term.toLowerCase())) {
				return type;
			}
		});

		term = _.startCase(term);
		filteredIssueTypes.pushObject({
			label: term,
			value: term
		});
		return filteredIssueTypes;
	}
}
