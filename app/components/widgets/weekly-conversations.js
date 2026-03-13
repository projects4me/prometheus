/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from 'prometheus/components/widgets';
import { action } from '@ember/object';
import ENV from 'prometheus/config/environment';
import { tracked } from '@glimmer/tracking';
import DateUtils from 'prometheus/utils/date';

/**
 * A widget component that displays weekly conversations grouped by conversation room.
 * Provides pagination by week and fetches comments for the selected week.
 *
 * @class WidgetsWeeklyConversationsComponent
 * @namespace Prometheus.Components.Widgets
 * @module Widgets.WeeklyConversations
 * @extends WidgetsComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <Widgets::WeeklyConversations
 *   @data={{this.comments}}
 *   @widgetSettings={{this.widgetSettings}}
 * />
 */
export default class WidgetsWeeklyConversationsComponent extends WidgetsComponent {
	/**
	 * API's host for fetching user images.
	 *
	 * @property apiHost
	 * @type {String}
	 * @public
	 */
	apiHost = ENV.api.host;

	/**
	 * The start date of the currently selected week.
	 * @property startWeek
	 * @type {String|Date}
	 * @public
	 */
	@tracked startWeek = DateUtils.getWeekRangeForPage(1).startOfWeek;

	/**
	 * The end date of the currently selected week.
	 * @property endWeek
	 * @type {String|Date}
	 * @public
	 */
	@tracked endWeek = DateUtils.getWeekRangeForPage(1).endOfWeek;

	/**
	 * The list of comment records to display, provided via the component's arguments.
	 * @property comments
	 * @type {Array}
	 * @public
	 */
	@tracked comments = this.args.data || [];

	/**
	 * Whether a refresh operation is currently in progress
	 * @property isRefreshing
	 * @type {boolean}
	 * @public
	 */
	@tracked isRefreshing = false;

	/**
	 * Internal cache for comments grouped by conversation subject.
	 * @property commentsByConversationSubject
	 * @type {Object}
	 * @private
	 */
	@tracked commentsByConversationSubject = {};

	/**
	 * Groups comments by their related conversation room (relatedId).
	 * Comments are organized by conversation subject for display in accordion sections.
	 *
	 * @property data
	 * @type {Object}
	 * @public
	 */
	get data() {
		let comments = this.comments.toArray() || [];
		let commentsByRelatedModule = {};

		comments.forEach((comment) => {
			let relatedId = comment.relatedId;
			if (!commentsByRelatedModule[relatedId]) {
				commentsByRelatedModule[relatedId] = [];
			}
			commentsByRelatedModule[relatedId].push(comment);
		});

		this.commentsByConversationSubject = commentsByRelatedModule;
		return commentsByRelatedModule;
	}

	/**
	 * Retrieves the conversation room subject title for a given relatedId.
	 * Used as the accordion section title.
	 *
	 * @method getTitle
	 * @param {String} relatedId - The conversation room identifier
	 * @returns {String} - The conversation room subject
	 * @public
	 * @action
	 */
	@action getTitle(relatedId) {
		let comments = this.commentsByConversationSubject[relatedId];
		let title = '';
		if (comments.length > 0) {
			title = comments[0].conversationRoom.get('subject');
		}
		return title;
	}

	/**
	 * Retrieves all comments for a specific conversation room.
	 * Used to populate the accordion section content.
	 *
	 * @method getComments
	 * @param {String} relatedId - The conversation room identifier
	 * @returns {Array} - Array of comments for the conversation room
	 * @public
	 * @action
	 */
	@action getComments(relatedId) {
		return this.commentsByConversationSubject[relatedId];
	}

	/**
	 * Queries the store for comments within the given week range.
	 * Single source of truth for the comment fetch used by both
	 * onPageChange and refresh.
	 *
	 * @method fetchComments
	 * @param {String} startWeek - Start of the week range
	 * @param {String} endWeek - End of the week range
	 * @returns {Promise<Array>}
	 * @private
	 */
	async fetchComments(startWeek, endWeek) {
		let commentOptions = this.baseOptions();
		commentOptions.query = `(Comment.dateCreated BETWEEN ${startWeek} AND ${endWeek})`;
		return await this.store.query('comment', commentOptions);
	}

	/**
	 * Refreshes the widget by re-fetching comments for the currently
	 * displayed week.
	 *
	 * @method refresh
	 * @public
	 * @action
	 */
	@action
	async refresh() {
		this.isRefreshing = true;
		try {
			this.comments = await this.fetchComments(this.startWeek, this.endWeek);
		} catch (error) {
			console.error('Error refreshing conversations:', error);
		} finally {
			this.isRefreshing = false;
		}
	}

	/**
	 * Handles pagination changes, fetching comments for the selected week.
	 * Updates the week range and queries the store for comments within the date range.
	 *
	 * @method onPageChange
	 * @param {Object} paginationInfo - Contains the page number (week index)
	 * @public
	 * @action
	 * @returns {Promise<Object>} - Resolves with the new comments or empty array on error
	 */
	@action
	async onPageChange(paginationInfo = {}) {
		try {
			const { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(
				paginationInfo.page
			);
			this.startWeek = startOfWeek;
			this.endWeek = endOfWeek;
			this.comments = await this.fetchComments(this.startWeek, this.endWeek);
			return {
				items: this.comments
			};
		} catch (error) {
			console.error('Error fetching comments:', error);
			return {
				items: []
			};
		}
	}

	/**
	 * Determines whether there are any conversations to display.
	 * Used to show/hide the empty state component.
	 *
	 * @property hasConversations
	 * @type {Boolean}
	 * @public
	 */
	get hasConversations() {
		return this.comments.length > 0;
	}

	/**
	 * Determines the type of entity the conversation is related to.
	 * Returns 'issue' if the conversation room is linked to an issue, otherwise 'conversationRoom'.
	 *
	 * @method conversationRelatedTo
	 * @param {String} relatedId - The ID of the related conversation subject
	 * @returns {String} - 'issue' or 'conversationRoom'
	 * @public
	 * @action
	 */
	@action
	conversationRelatedTo(relatedId) {
		let comments = this.commentsByConversationSubject[relatedId];
		let comment = comments[0];
		let relatedTo = 'conversationRoom';
		if (comment.get('conversationRoom').get('issueNumber')) {
			relatedTo = 'issue';
		}
		return relatedTo;
	}

	/**
	 * Returns the route model array for navigating to an issue page.
	 * The array contains the project shortcode and the issue number.
	 *
	 * @method getIssueRouteModel
	 * @param {String} relatedId - The ID of the related conversation subject
	 * @returns {Array} - [projectShortcode, issueNumber]
	 * @public
	 * @action
	 */
	@action
	getIssueRouteModel(relatedId) {
		let comments = this.commentsByConversationSubject[relatedId];
		let comment = comments[0];
		let issueNumber = comment.get('conversationRoom').get('issueNumber');
		let projectShortcode = comment
			.get('conversationRoom')
			.get('projectShortcode');
		return [projectShortcode, issueNumber];
	}

	/**
	 * Returns the project shortcode for navigating to a conversation room.
	 *
	 * @method getConversationRouteModel
	 * @param {String} relatedId - The ID of the related conversation subject
	 * @returns {String} - projectShortcode
	 * @public
	 * @action
	 */
	@action
	getConversationRouteModel(relatedId) {
		let comments = this.commentsByConversationSubject[relatedId];
		let comment = comments[0];
		return comment.get('conversationRoom').get('projectShortcode');
	}

	/**
	 * Returns the conversation room ID to be used as a query parameter to scroll to the specific conversation room
	 *
	 * @method getConversationRouteQuery
	 * @param {String} relatedId - The ID of the related conversation subject
	 * @returns {String} - conversationRoomId
	 * @public
	 * @action
	 */
	@action
	getConversationRouteQuery(relatedId) {
		let comments = this.commentsByConversationSubject[relatedId];
		let comment = comments[0];
		return comment.get('conversationRoom').get('id');
	}
}
