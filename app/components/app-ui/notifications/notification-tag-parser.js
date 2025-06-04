/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

/**
 * This component is responsible for parsing notification content and replacing special tags
 * with formatted HTML content. It handles two types of tags:
 * 1. Module tags in format {{ModuleName@id}} - Replaces with module data
 * 2. Field tags in format {{fieldName:value}} - Replaces with formatted field display
 *
 * @class AppUiNotificationsNotificationTagParserComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiNotificationsNotificationTagParserComponent extends AppComponent {
	/**
	 * This property contains the parsed content.
	 *
	 * @property parsedContent
	 * @type String
	 * @for AppUiNotificationsNotificationTagParserComponent
	 * @public
	 */
	@tracked parsedContent;

	/**
	 * Map of module handlers - each handler function generates HTML for a specific module type
	 *
	 * @property moduleHandlers
	 * @type Object
	 * @for AppUiNotificationsNotificationTagParserComponent
	 * @public
	 */
	moduleHandlers = {
		user: this.renderUserModule,
		project: this.renderProjectModule,
		issue: this.renderIssueModule,
		comment: this.renderCommentModule,
		timelog: this.renderTimelogModule,
		milestone: this.renderMilestoneModule
	};

	/**
	 * Map of field handlers - each handler function formats a specific field type
	 *
	 * @property fieldHandlers
	 * @type Object
	 * @for AppUiNotificationsNotificationTagParserComponent
	 * @public
	 */
	fieldHandlers = {
		status: this.renderStatusField,
		priority: this.renderPriorityField,
		createdUser: this.renderCreatedUserField
	};

	constructor() {
		super(...arguments);
		this.parseContent();
	}

	/**
	 * Parses the notification content by replacing module and field tags
	 * with their corresponding HTML representations.
	 *
	 * @method parseContent
	 * @public
	 */
	parseContent() {
		let content = this.replaceModuleTags(this.args.notification);
		content = this.replaceFieldTags(content);

		this.parsedContent = htmlSafe(content);
	}

	/**
	 * Replaces module tags (e.g. {{User@123}}) with formatted HTML content
	 *
	 * @method replaceModuleTags
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} Content with module tags replaced
	 * @public
	 */
	replaceModuleTags(notification) {
		let content = notification.description || '';
		const modulePattern = /\{\{([A-Za-z]+)@([A-Za-z0-9\-_]+)\}\}/g;
		let matches = [...content.matchAll(modulePattern)];
		for (const match of matches) {
			const [fullMatch, moduleName, id] = match;
			const moduleType = moduleName.toLowerCase();

			try {
				const handler =
					this.moduleHandlers[moduleType] ||
					this.moduleHandlers.default;
				const replacementHtml = handler.call(this, notification);
				content = content.replace(fullMatch, replacementHtml);
			} catch (error) {
				// If module not found, leave as is or replace with ID
				content = content.replace(fullMatch, `${moduleName} ${id}`);
			}
		}

		return content;
	}

	/**
	 * Replaces field tags (e.g. {{status:open}}) with formatted HTML content.
	 *
	 * @method replaceFieldTags
	 * @param {String} content The content to parse.
	 * @return {String} Content with field tags replaced
	 * @public
	 */
	replaceFieldTags(content) {
		const fieldPattern = /\{\{([A-Za-z]+):([A-Za-z0-9_-]+)\}\}/g;
		return content.replace(fieldPattern, (fullMatch, fieldName, value) => {
			// Get the appropriate handler for this field type or use default
			const handler = this.fieldHandlers[fieldName]
				? this.fieldHandlers[fieldName]
				: (val) => this.renderDefaultField(fieldName, val);

			return handler.call(this, value);
		});
	}

	/**
	 * Renders user module HTML
	 *
	 * @method renderUserModule
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} HTML representation of user
	 * @public
	 */
	renderUserModule(notification) {
		return `<a href="/app/user/${notification.context.userId}">${notification.context.userName}</a>`;
	}

	/**
	 * Renders project module HTML
	 *
	 * @method renderProjectModule
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} HTML representation of project
	 * @public
	 */
	renderProjectModule(notification) {
		return `<a href="/app/project/${notification.context.projectShortcode.toLowerCase()}">${notification.context.projectName}</a>`;
	}

	/**
	 * Renders issue module HTML
	 *
	 * @method renderIssueModule
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} HTML representation of issue
	 * @public
	 */
	renderIssueModule(notification) {
		return `<a href="/app/project/${notification.context.projectShortcode.toLowerCase()}/issue/${notification.context.issueNumber}">#${notification.context.issueNumber}</a>`;
	}

	/**
	 * Renders comment module HTML
	 *
	 * @method renderCommentModule
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} HTML representation of comment
	 * @public
	 */
	renderCommentModule(notification) {
		return `<a href="/app/project/${notification.context.projectShortcode.toLowerCase()}/issue/${notification.context.issueNumber}?s_id=${notification.context.commentId}">commented</a>`;
	}

	/**
	 * Renders timelog module HTML
	 *
	 * @method renderTimelogModule
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} HTML representation of timelog
	 * @public
	 */
	renderTimelogModule(notification) {
		return `<a href="/app/project/${notification.context.projectShortcode.toLowerCase()}/issue/${notification.context.issueNumber}?s_id=${notification.context.timelogId}">${notification.context.timelogType}</a>`;
	}

	/**
	 * Renders milestone module HTML
	 *
	 * @method renderMilestoneModule
	 * @param {Prometheus.Models.Systemnotification} notification The notification to parse.
	 * @return {String} HTML representation of milestone
	 * @public
	 */
	renderMilestoneModule(notification) {
		return `<a href="/app/project/${notification.context.projectShortcode.toLowerCase()}/milestone/${notification.context.milestoneId}">${notification.context.milestoneName}</a>`;
	}

	/**
	 * Renders status field HTML
	 *
	 * @method renderStatusField
	 * @param {String} value Status value
	 * @return {String} HTML representation of status
	 * @public
	 */
	renderStatusField(value) {
		let translatedStatus = this.intl.t(`views.app.issue.lists.status.${value}`);
		return `<span class="badge ${value}">${translatedStatus}</span>`;
	}

	/**
	 * Renders priority field HTML
	 *
	 * @method renderPriorityField
	 * @param {String} value Priority value
	 * @return {String} HTML representation of priority
	 * @public
	 */
	renderPriorityField(value) {
		let translatedPriority = this.intl.t(`views.app.issue.lists.priority.${value}`);
		return `<span class="priority-tag ${value}">${translatedPriority}</span>`;
	}

	/**
	 * Renders created user field HTML
	 *
	 * @method renderCreatedUserField
	 * @param {String} value Created user value
	 * @return {String} HTML representation of created user
	 * @public
	 */
	renderCreatedUserField(value) {
		let notification = this.args.notification;
		return `<a href="/app/user/${value}">${notification.createdUserName}</a>`;
	}
}
