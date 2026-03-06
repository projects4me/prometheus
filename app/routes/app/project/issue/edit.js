/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import format from 'prometheus/utils/data/format';
import App from 'prometheus/routes/app';

/**
 * The issues edit route
 *
 * @class Edit
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({
	/**
	 * This is the template that we want to display for this the Edit view
	 *
	 * @property templateName
	 * @for Edit
	 * @type String
	 * @public
	 */
	templateName: 'app/project/issue/create',

	/**
	 * We are using dynamic segments and since model is not called
	 * again for a route that is using dynamic segment we are relying
	 * on the afterModel hook so that the controller waits since we
	 * return a Promise.
	 *
	 * @method model
	 * @param {Object} params
	 * @return Prometheus.Issue
	 * @private
	 */
	async afterModel(params) {
		Logger.debug('Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
		let _self = this;
		let projectId = _self.trackedProject.getProjectId();
		let issueNumber = params.issue_number;
		let projectOptions = {
			query: '(Project.id : ' + projectId + ')',
			rels: 'members,milestones,issuetypes,issuestatuses',
			sort: 'members.name',
			limit: -1
		};

		let issueOptions = {
			query: '(Issue.issueNumber : ' + issueNumber + ')',
			sort: 'Issue.issueNumber',
			rels: 'parentissue',
			order: 'ASC',
			limit: -1
		};
		try {
			let issue = await _self.get('store').query('issue', issueOptions);
			let project = await _self
				.get('store')
				.query('project', projectOptions);
			let projectData = project.objectAt(0);
			if (
				projectData.issuestatuses === undefined ||
				projectData.issuestatuses.length === 0
			) {
				let issueStatuses = await _self
					.get('store')
					.query('issuestatus', {
						query: '(Issuestatus.system : 1)',
						limit: -1
					});
				projectData.issuestatuses = issueStatuses;
			}
			let issueData = issue.objectAt(0);

			this.set('issue', issueData);
			this.set('project', projectData);
			Logger.debug(
				'-Prometheus.Routes.App.Project.Issue.Edit::afterModel()'
			);
		} catch (error) {
			_self.errorManager.handleError(error, {
				moduleName: 'issue'
			});
		}
	},

	/**
	 * The setupController hook for issue edit route.
	 *
	 * @method setupController
	 * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
	 */
	setupController: function (controller) {
		Logger.debug(
			'Prometheus.Routes.App.Project.Issue.Edit::setupController'
		);
		let params = this.paramsFor('app.project.issue.edit');

		this.breadcrumb.setTitle('app.project.issue.page', `#${params.issue_number}`);
		controller.set('model', this.get('issue'));
		controller.set('project', this.get('project'));
		controller.set('types', this.get('project').issuetypes);
		controller.set('statuses', this.get('project').issuestatuses);
		controller.set('issueDescription', this.get('issue').description);

		let priority = new format(this).getList(
			'views.app.issue.lists.priority'
		);
		controller.set('priority', priority);

		Logger.debug(
			'-Prometheus.Routes.App.Project.Issue.Edit::setupController'
		);
	}
});
