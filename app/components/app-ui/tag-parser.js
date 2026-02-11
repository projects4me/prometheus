/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../app';
import { htmlSafe } from '@ember/template';

/**
 * This component is responsible for parsing content and replacing special tags
 * with formatted HTML content. It handles two types of tags:
 * 1. Module tags in format {{ModuleName@id}} - Replaces with module data
 * 2. Field tags in format {{fieldName:value}} - Replaces with formatted field display
 *
 * This component can be used for notifications, activities, or any other content
 * that contains these special tags.
 *
 * @class AppUiTagParserComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiTagParserComponent extends AppComponent {
	/**
	 * Map of module handlers - each handler function generates HTML for a specific module type
	 *
	 * @property moduleHandlers
	 * @type Object
	 * @for AppUiTagParserComponent
	 * @public
	 */
	moduleHandlers = {
		user: this.renderUserModule,
		project: this.renderProjectModule,
		issue: this.renderIssueModule,
		comment: this.renderCommentModule,
		timelog: this.renderTimelogModule,
		milestone: this.renderMilestoneModule,
        conversationroom: this.renderConversationRoomModule
	};

	/**
	 * Map of field handlers - each handler function formats a specific field type
	 *
	 * @property fieldHandlers
	 * @type Object
	 * @for AppUiTagParserComponent
	 * @public
	 */
	fieldHandlers = {
		status: this.renderStatusField,
		priority: this.renderPriorityField,
		createdUser: this.renderCreatedUserField
	};

	/**
	 * This property contains the parsed content.
	 * It's computed reactively based on the content and context arguments.
	 *
	 * @property parsedContent
	 * @type String
	 * @for AppUiTagParserComponent
	 * @public
	 */
	get parsedContent() {
		let content = this.replaceModuleTags(this.args.content || '');
		content = this.replaceFieldTags(content);
		return htmlSafe(content);
	}

	/**
	 * Replaces module tags (e.g. {{User@123}}) with formatted HTML content
	 *
	 * @method replaceModuleTags
	 * @param {String} content The content to parse.
	 * @return {String} Content with module tags replaced
	 * @public
	 */
	replaceModuleTags(content) {
		const modulePattern = /\{\{([A-Za-z]+)@([A-Za-z0-9\-_]+)\}\}/g;
		let matches = [...content.matchAll(modulePattern)];
		const context = this.args.context || {};

		for (const match of matches) {
			const [fullMatch, moduleName, id] = match;
			const moduleType = moduleName.toLowerCase();

			try {
				const handler = this.moduleHandlers[moduleType];
				if (handler) {
					const replacementHtml = handler.call(this, context);
					content = content.replace(fullMatch, replacementHtml);
				} else {
					// If module handler not found, replace with module name and ID
					content = content.replace(fullMatch, `${moduleName} ${id}`);
				}
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
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of user
	 * @public
	 */
	renderUserModule(context) {
		if (!context.userId || !context.userName) {
			return '';
		}
		return `<a href="/app/user/${context.userId}">${context.userName}</a>`;
	}

	/**
	 * Renders project module HTML
	 *
	 * @method renderProjectModule
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of project
	 * @public
	 */
	renderProjectModule(context) {
		if (!context.projectShortcode || !context.projectName) {
			return '';
		}
		return `<a href="/app/project/${context.projectShortcode.toLowerCase()}">${context.projectName}</a>`;
	}

	/**
	 * Renders issue module HTML
	 *
	 * @method renderIssueModule
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of issue
	 * @public
	 */
	renderIssueModule(context) {
		if (!context.projectShortcode || !context.issueNumber) {
			return '';
		}
		return `<a href="/app/project/${context.projectShortcode.toLowerCase()}/issue/${context.issueNumber}">#${context.issueNumber}</a>`;
	}

	/**
	 * Renders comment module HTML
	 *
	 * @method renderCommentModule
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of comment
	 * @public
	 */
	renderCommentModule(context) {
		if (!context.projectShortcode || !context.issueNumber || !context.commentId) {
			return '';
		}
		return `<a href="/app/project/${context.projectShortcode.toLowerCase()}/issue/${context.issueNumber}?s_id=${context.commentId}">commented</a>`;
	}

	/**
	 * Renders timelog module HTML
	 *
	 * @method renderTimelogModule
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of timelog
	 * @public
	 */
	renderTimelogModule(context) {
		if (!context.projectShortcode || !context.issueNumber || !context.timelogId || !context.timelogType) {
			return '';
		}
		return `<a href="/app/project/${context.projectShortcode.toLowerCase()}/issue/${context.issueNumber}?s_id=${context.timelogId}">${context.timelogType}</a>`;
	}

	/**
	 * Renders milestone module HTML
	 *
	 * @method renderMilestoneModule
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of milestone
	 * @public
	 */
	renderMilestoneModule(context) {
		if (!context.projectShortcode || !context.milestoneId || !context.milestoneName) {
			return '';
		}
		return `<a href="/app/project/${context.projectShortcode.toLowerCase()}/milestone/${context.milestoneId}">${context.milestoneName}</a>`;
	}

	/**
	 * Renders conversation room module HTML
	 *
	 * @method renderConversationRoomModule
	 * @param {Object} context The context object containing data for rendering.
	 * @return {String} HTML representation of conversation room
	 * @public
	 */
	renderConversationRoomModule(context) {
		if (!context.projectShortcode || !context.conversationId) {
			return '';
		}
		return `<a href="/app/project/${context.projectShortcode.toLowerCase()}/conversations?c_id=${context.conversationId}">${this.intl.t('views.app.activity.conversation')}</a>`;
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
		const createdUserName = this.args.createdUserName || '';
		if (!value || !createdUserName) {
			return '';
		}
		return `<a href="/app/user/${value}">${createdUserName}</a>`;
	}

	/**
	 * Renders default field HTML for unknown field types
	 *
	 * @method renderDefaultField
	 * @param {String} fieldName The name of the field
	 * @param {String} value The value of the field
	 * @return {String} HTML representation of the field
	 * @public
	 */
	renderDefaultField(fieldName, value) {
		return `<span class="field-tag ${fieldName}">${value}</span>`;
	}
}

