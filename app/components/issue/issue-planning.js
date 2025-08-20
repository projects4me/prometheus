/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isArray } from '@ember/array';
import AppComponent from 'prometheus/components/app';
import DateUtils from 'prometheus/utils/date';
import { htmlSafe } from '@ember/template';

/**
 * Component for rendering the issue planning modal and managing AI-generated task planning
 * This component handles the creation of sub-tasks and test cases from AI-generated task plans
 *
 * @class IssueIssuePlanningComponent
 * @namespace Prometheus.Components.Issue
 * @extends AppComponent
 * @public
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IssueIssuePlanningComponent extends AppComponent {
	/**
	 * Array of selected task IDs for issue creation
	 * @type {Array}
	 * @public
	 */
	@tracked selectedTasks = [];

	/**
	 * Object mapping task IDs to arrays of selected test case indexes
	 * @type {Object}
	 * @public
	 */
	@tracked selectedTests = {};

	/**
	 * Array of task IDs that are disabled due to dependency constraints
	 * @type {Array}
	 * @public
	 */
	@tracked disabledDependencies = [];

	/**
	 * Count of successfully created issues
	 * @type {Number}
	 * @public
	 */
	@tracked addedIssuesCount = 0;

	/**
	 * Object mapping task IDs to their created issue records
	 * @type {Object}
	 * @public
	 */
	@tracked addedTasks = {};

	/**
	 * Object mapping task IDs to their creation states ('creating', 'success', 'error')
	 * @type {Object}
	 * @public
	 */
	@tracked creationStates = {};

	/**
	 * Boolean indicating if the planning process has started
	 * @type {Boolean}
	 * @public
	 */
	@tracked planStarted = false;

	/**
	 * Initializes the component with pre-selected tasks and tests from the provided data
	 * Sets up the initial state for task and test selection
	 *
	 * @method initializeSelections
	 * @public
	 */
	@action initializeSelections() {
		this.planStarted = false;
		if (!this.args.data || !isArray(this.args.data.tasks)) return;
		this.selectedTasks = this.args.data.tasks.map((task) => task.id);
		let tests = {};
		this.args.data.tasks.forEach((task) => {
			tests[task.id] = (task.tests || []).map((_, idx) => idx);
		});
		this.selectedTests = tests;
		this.updateDisabledDependencies();
	}

	/**
	 * Gets the count of selected tasks
	 * @type {Number}
	 * @public
	 */
	get selectedTasksCount() {
		return this.selectedTasks.length;
	}

	/**
	 * Gets the total count of selected test cases across all tasks
	 * @type {Number}
	 * @public
	 */
	get selectedTestsCount() {
		let count = 0;
		Object.values(this.selectedTests).forEach((arr) => {
			count += arr.length;
		});
		return count;
	}

	/**
	 * Builds a recursive task tree for hierarchical rendering and creation
	 * Filters out disabled dependencies and organizes tasks in a parent-child structure
	 * @type {Array}
	 * @public
	 */
	get taskTree() {
		const tasks = (this.args.data?.tasks || []).filter(
			(t) => !this.disabledDependencies.includes(t.id)
		);
		const taskMap = {};
		tasks.forEach((task) => {
			taskMap[task.id] = { task, children: [] };
		});
		const roots = [];
		tasks.forEach((task) => {
			const dep = task.dependency;
			if (!dep || this.disabledDependencies.includes(dep)) {
				roots.push(taskMap[task.id]);
			} else if (taskMap[dep]) {
				taskMap[dep].children.push(taskMap[task.id]);
			} else {
				roots.push(taskMap[task.id]);
			}
		});
		return roots;
	}

	/**
	 * Calculates the total estimated hours for a task including its selected test cases
	 *
	 * @method getTaskTotalEstimatedHours
	 * @param {Object} task The task object
	 * @return {Number} Total estimated hours
	 * @public
	 */
	@action
	getTaskTotalEstimatedHours(task) {
		if (!this.selectedTasks.includes(task.id)) {
			return 0;
		}
		let total = Number(task.estimated_hours) || 0;
		const selectedTestIndexes = this.selectedTests[task.id] || [];
		selectedTestIndexes.forEach((idx) => {
			const test = (task.tests || [])[idx];
			if (test) {
				total += Number(test.estimated_hours) || 0;
			}
		});
		return total;
	}

	/**
	 * Gets the estimated hours for a task excluding test cases
	 *
	 * @method getTaskOwnEstimatedHours
	 * @param {Object} task The task object
	 * @return {Number} Task's own estimated hours
	 * @public
	 */
	@action
	getTaskOwnEstimatedHours(task) {
		if (!this.selectedTasks.includes(task.id)) {
			return 0;
		}
		return Number(task.estimated_hours) || 0;
	}

	/**
	 * Toggles the selection state of a task and its associated test cases
	 *
	 * @method toggleTaskSelection
	 * @param {String} taskId The ID of the task to toggle
	 * @param {Event} event The checkbox change event
	 * @public
	 */
	@action toggleTaskSelection(taskId, event) {
		const task = this.args.data.tasks.find((t) => t.id === taskId);
		const allTestIndexes = (task?.tests || []).map((_, idx) => idx);
		if (event.target.checked) {
			if (!this.selectedTasks.includes(taskId)) {
				this.selectedTasks = [...this.selectedTasks, taskId];
			}
			// Check all test cases for this task
			this.selectedTests = {
				...this.selectedTests,
				[taskId]: allTestIndexes
			};
		} else {
			this.selectedTasks = this.selectedTasks.filter(
				(id) => id !== taskId
			);
			// Uncheck all test cases for this task
			this.selectedTests = {
				...this.selectedTests,
				[taskId]: []
			};
		}
		this.updateDisabledDependencies();
	}

	/**
	 * Toggles the selection state of a specific test case
	 *
	 * @method toggleTestSelection
	 * @param {String} taskId The ID of the parent task
	 * @param {Number} testIdx The index of the test case
	 * @param {Event} event The checkbox change event
	 * @public
	 */
	@action toggleTestSelection(taskId, testIdx, event) {
		let arr = this.selectedTests[taskId] || [];
		let newArr;
		if (event.target.checked) {
			if (!arr.includes(testIdx)) {
				newArr = [...arr, testIdx];
				this.selectedTests = {
					...this.selectedTests,
					[taskId]: newArr
				};
			}
			// If the parent task is not checked, check it
			if (!this.selectedTasks.includes(taskId)) {
				this.selectedTasks = [...this.selectedTasks, taskId];
			}
		} else {
			newArr = arr.filter((idx) => idx !== testIdx);
			this.selectedTests = {
				...this.selectedTests,
				[taskId]: newArr
			};
		}
	}

	/**
	 * Updates the list of disabled dependencies based on unchecked tasks
	 * Tasks that depend on unchecked tasks are disabled
	 *
	 * @method updateDisabledDependencies
	 * @public
	 */
	@action updateDisabledDependencies() {
		// Find all unchecked tasks that are dependencies for other tasks
		const unchecked = this.args.data.tasks
			.filter((task) => !this.selectedTasks.includes(task.id))
			.map((task) => task.id);
		this.disabledDependencies = unchecked;
	}

	/**
	 * Checks if a task is disabled due to its dependency being unchecked
	 *
	 * @method isDependencyDisabled
	 * @param {Object} task The task to check
	 * @return {Boolean} True if the task is disabled
	 * @public
	 */
	@action isDependencyDisabled(task) {
		// If this task has a dependency, and that dependency is in disabledDependencies, return true
		if (
			task.dependency &&
			this.disabledDependencies.includes(task.dependency)
		) {
			return true;
		}
		return false;
	}

	/**
	 * Handles the confirmation action to create the issue plan
	 *
	 * @method onConfirm
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async onConfirm() {
		await this.createIssuePlan({
			selectedTasks: this.selectedTasks,
			selectedTests: this.selectedTests,
			disabledDependencies: this.disabledDependencies
		});
	}

	/**
	 * Creates the issue plan by recursively creating issues for selected tasks
	 *
	 * @method createIssuePlan
	 * @param {Object} data Object containing selected tasks, tests, and dependencies
	 * @public
	 * @async
	 * @returns {Promise<Boolean>} Success status of the operation
	 */
	@action
	async createIssuePlan(data) {
		let _self = this;
		this.planStarted = true;
		let currentIssue = this.args.issue;
		let project = this.args.project;
		let messenger = new Messenger().post({
			message: _self.intl.t('views.app.issue.planWithAi.creatingPlan'),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});
		let issueStatus = this.getIssueStatus(messenger);
		let issueType = this.getIssueType(messenger);
		try {
			for (let rootNode of this.taskTree) {
				await this.createIssueRecursive(
					rootNode,
					currentIssue,
					project,
					data,
					messenger,
					issueStatus,
					issueType
				);
			}
			await this.showSuccessMessage(messenger, currentIssue);
		} catch (e) {
			this.updateMessengerForPlan(messenger, this.intl, 'error');
			console.error(e);
			return false;
		}
	}

	/**
	 * Recursively creates issues and their children in the task hierarchy
	 *
	 * @method createIssueRecursive
	 * @param {Object} node The current node in the task tree
	 * @param {Object} currentIssue The parent issue
	 * @param {Object} project The project object
	 * @param {Object} data The planning data
	 * @param {Object} messenger The messenger instance
	 * @param {Object} issueStatus The issue status to use
	 * @param {Object} issueType The issue type to use
	 * @public
	 * @async
	 * @returns {Promise<Object|null>} The created issue or null on error
	 */
	async createIssueRecursive(
		node,
		currentIssue,
		project,
		data,
		messenger,
		issueStatus,
		issueType
	) {
		const { task, children } = node;
		if (
			this.creationStates[task.id] &&
			this.creationStates[task.id] !== 'error'
		)
			return this.addedTasks[task.id];
		this.setCreationState(task.id, 'creating');
		let issue, timelog;
		try {
			issue = this.createIssueRecord(
				task,
				currentIssue,
				project,
				issueStatus,
				issueType
			);
			// Set parentId to its dependency (if exists in addedTasks), else to currentIssue.id
			const dep = task.dependency;
			if (dep && this.addedTasks[dep]) {
				issue.parentId = this.addedTasks[dep].id;
			} else {
				issue.parentId = currentIssue.id;
			}
			timelog = this.createTimelogRecord(task, project);
			this.appendTestCasesToDescription(
				issue,
				task,
				data.selectedTests[task.id],
				this.intl,
				timelog
			);
			issue = await issue.save();
			timelog.issueId = issue.id;
			timelog = await timelog.save();
			this.updateMessengerForIssue(messenger, this.intl, issue);
			this.addedTasks[task.id] = issue;
			this.addedIssuesCount++;
			this.setCreationState(task.id, 'success');
		} catch (e) {
			this.setCreationState(task.id, 'error');
			console.error(e);
			messenger.update({
				message: this.intl.t(
					'views.app.issue.planWithAi.planCreationFailed'
				),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			return null;
		}
		// Recursively create children
		for (let childNode of children) {
			await this.createIssueRecursive(
				childNode,
				currentIssue,
				project,
				data,
				messenger,
				issueStatus,
				issueType
			);
		}
		return issue;
	}

	/**
	 * Retries the creation of a specific task and its children
	 *
	 * @method retryTaskRecursive
	 * @param {Object} node The node to retry
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async retryTaskRecursive(node) {
		let currentIssue = this.args.issue;
		let project = this.args.project;
		let messenger = new Messenger().post({
			message: this.intl.t('views.app.issue.planWithAi.retryingTask', {
				taskId: node.task.id,
				taskSubject: node.task.subject
			}),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});
		let issueStatus = this.getIssueStatus(messenger);
		let issueType = this.getIssueType(messenger);

		let data = {
			selectedTasks: this.selectedTasks,
			selectedTests: this.selectedTests,
			disabledDependencies: this.disabledDependencies
		};

		try {
			await this.createIssueRecursive(
				node,
				currentIssue,
				project,
				data,
				messenger,
				issueStatus,
				issueType
			);
			await this.showSuccessMessage(messenger, currentIssue);
		} catch (e) {
			console.error(e);
			messenger.update({
				message: this.intl.t(
					'views.app.issue.planWithAi.planCreationFailed'
				),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
		}
	}

	/**
	 * Shows success message when all issues are created successfully
	 *
	 * @method showSuccessMessage
	 * @param {Object} messenger The messenger instance
	 * @param {Object} currentIssue The current issue being planned
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async showSuccessMessage(messenger, currentIssue) {
		if (this.addedIssuesCount === this.selectedTasks.length) {
			this.updateMessengerForPlan(messenger, this.intl, 'success');
			currentIssue.isPlanned = 1;
			await currentIssue.save();
			await this.router.refresh();
			this.args.onClose();
			let issueHierarchyEl = document.querySelector('.issue-hierarchy');
			this.args.scrollAndHighlight(issueHierarchyEl, true);
		}
	}

	/**
	 * Gets the 'new' issue status for created sub-tasks
	 *
	 * @method getIssueStatus
	 * @param {Object} messenger The messenger instance for error handling
	 * @return {Object|null} The issue status object or null if not found
	 * @public
	 */
	@action
	getIssueStatus(messenger) {
		try {
			let issueStatus = this.args.issueStatuses.find(
				(status) => status.name === 'new'
			);
			if (issueStatus) {
				return issueStatus;
			} else {
				throw new Error('Issue status "new" not found');
			}
		} catch (e) {
			console.error(e);
			this.updateMessengerForPlan(messenger, this.intl, 'error');
		}
	}

	/**
	 * Gets the 'Sub Task' issue type for created sub-tasks
	 *
	 * @method getIssueType
	 * @param {Object} messenger The messenger instance for error handling
	 * @return {Object|null} The issue type object or null if not found
	 * @public
	 */
	@action
	getIssueType(messenger) {
		try {
			let issueType = this.args.issueTypes.find(
				(type) => type.name === 'Sub Task'
			);
			if (issueType) {
				return issueType;
			} else {
				throw new Error('Issue type "Sub Task" not found');
			}
		} catch (e) {
			console.error(e);
			this.updateMessengerForPlan(messenger, this.intl, 'error');
		}
	}

	/**
	 * Creates an issue record with the provided task data
	 *
	 * @method createIssueRecord
	 * @param {Object} taskData The task data to create the issue from
	 * @param {Object} currentIssue The parent issue
	 * @param {Object} project The project object
	 * @param {Object} issueStatus The issue status
	 * @param {Object} issueType The issue type
	 * @return {Object} The created issue record
	 * @private
	 */
	createIssueRecord(taskData, currentIssue, project, issueStatus, issueType) {
		return this.store.createRecord('issue', {
			projectId: project.id,
			subject: taskData.subject,
			projectShortcode: project.shortCode,
			description: taskData.description,
			milestoneId: currentIssue.milestoneId,
			typeId: issueType.id,
			priority: currentIssue.priority,
			endDate: currentIssue.issuemilestone.get('endDate'),
			owner: currentIssue.owner,
			assignee: currentIssue.assignee,
			reportedUser: currentIssue.reportedUser,
			statusId: issueStatus.id
		});
	}

	/**
	 * Creates a timelog record for the task's estimated hours
	 *
	 * @method createTimelogRecord
	 * @param {Object} taskData The task data
	 * @param {Object} project The project object
	 * @return {Object} The created timelog record
	 * @private
	 */
	createTimelogRecord(taskData, project) {
		let time = DateUtils.getHoursAndMinutes(taskData.estimated_hours);
		return this.store.createRecord('timelog', {
			projectId: project.id,
			projectShortcode: project.shortCode,
			context: 'est',
			hours: time.hours,
			minutes: time.minutes
		});
	}

	/**
	 * Appends test cases to the issue description and updates the timelog
	 *
	 * @method appendTestCasesToDescription
	 * @param {Object} issue The issue to update
	 * @param {Object} taskData The task data containing test cases
	 * @param {Array} selectedTests Array of selected test case indexes
	 * @param {Object} intl The internationalization service
	 * @param {Object} timelog The timelog to update
	 * @private
	 */
	appendTestCasesToDescription(
		issue,
		taskData,
		selectedTests,
		intl,
		timelog
	) {
		let translatedTestCases = intl.t(
			'views.app.issue.planWithAi.testCases',
			{
				count: selectedTests?.length || 0
			}
		);
		issue.description += `\n<hr>\n<div>\n<strong>${translatedTestCases}:</strong>\n</div>\n`;
		(selectedTests || []).forEach((testCaseIndex) => {
			let testCase = taskData.tests[testCaseIndex];
			let translatedScenario = intl.t(
				'views.app.issue.planWithAi.scenario'
			);
			let translatedTestCase = intl.t(
				'views.app.issue.planWithAi.testCase'
			);
			issue.description += `\n<div>\n<strong>${translatedScenario}:</strong> <span>${testCase.scenario}</span>\n</div>\n<div><strong>${translatedTestCase}:</strong> <pre class=\"issue-plan-test-case-pre\">${testCase.test_case}</pre></div>\n<br>\n`;
			let time = DateUtils.getHoursAndMinutes(testCase.estimated_hours);
			timelog.hours += time.hours;
			timelog.minutes += time.minutes;
		});
	}

	/**
	 * Updates the messenger with information about a created issue
	 *
	 * @method updateMessengerForIssue
	 * @param {Object} messenger The messenger instance
	 * @param {Object} intl The internationalization service
	 * @param {Object} issue The created issue
	 * @private
	 */
	updateMessengerForIssue(messenger, intl, issue) {
		messenger.update({
			message: htmlSafe(
				intl.t('views.app.issue.planWithAi.issueCreated', {
					issueNumber: issue.issueNumber,
					subject: issue.subject
				})
			),
			type: 'success',
			showCloseButton: true,
			hideAfter: 3
		});
	}

	/**
	 * Updates the messenger with plan creation result
	 *
	 * @method updateMessengerForPlan
	 * @param {Object} messenger The messenger instance
	 * @param {Object} intl The internationalization service
	 * @param {String} type The type of message ('success' or 'error')
	 * @private
	 */
	updateMessengerForPlan(messenger, intl, type) {
		const messages = {
			success: {
				message: intl.t('views.app.issue.planWithAi.planCreated'),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			},
			error: {
				message: intl.t(
					'views.app.issue.planWithAi.planCreationFailed'
				),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			}
		};
		messenger.update(messages[type]);
	}

	/**
	 * Sets the creation state for a task
	 *
	 * @method setCreationState
	 * @param {String} taskId The task ID
	 * @param {String} state The state to set ('creating', 'success', 'error')
	 * @private
	 */
	setCreationState(taskId, state) {
		this.creationStates = {
			...this.creationStates,
			[taskId]: state
		};
	}

	/**
	 * Recursively serializes a node and its children to a JSON object
	 *
	 * @method serializeNode
	 * @param {Object} node The node to serialize
	 * @return {Object} The serialized node object
	 * @private
	 */
	serializeNode(node) {
		return {
			...node.task,
			subTasks: node.children.map((child) => this.serializeNode(child))
		};
	}

	/**
	 * Copies a task node and its children to the clipboard as JSON
	 *
	 * @method copyToClipboard
	 * @param {Object} node The node to copy
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async copyToClipboard(node) {
		const data = this.serializeNode(node);
		const text = JSON.stringify(data, null, 2);
		try {
			await navigator.clipboard.writeText(text);
			new Messenger().post({
				message: this.intl.t(
					'views.app.issue.planWithAi.taskCopiedToClipboard'
				),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});
		} catch (e) {
			new Messenger().post({
				message: this.intl.t(
					'views.app.issue.planWithAi.taskCopyFailed'
				),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
		}
	}
}
