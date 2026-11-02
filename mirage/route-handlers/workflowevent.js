/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The payload paths every domain event carries
 *
 * @property COMMON
 * @type Array
 * @private
 */
const COMMON = [
	{ path: 'projectId', type: 'string' },
	{ path: 'occurredAt', type: 'datetime' },
	{ path: 'actor.id', type: 'string' },
	{ path: 'actor.name', type: 'string' }
];

/**
 * The issue fields an issue event carries
 *
 * @property ISSUE
 * @type Array
 * @private
 */
const ISSUE = ['id', 'subject', 'status', 'assignee', 'owner', 'priority', 'milestoneId', 'typeId']
	.map(field => ({ path: `issue.${field}`, type: 'string' }));

const changes = (...fields) => fields.flatMap(field => [
	{ path: `changes.${field}.before`, type: 'string' },
	{ path: `changes.${field}.after`, type: 'string' }
]);

/**
 * A part of Gaia's trigger catalog (TriggerEventDescriber), enough for the editor's pickers
 *
 * @property EVENTS
 * @type Array
 * @private
 */
const EVENTS = [
	{ name: 'issue.created', label: 'Issue created', module: 'Issue', on: 'create', watchedFields: [], fields: [...COMMON, ...ISSUE] },
	{ name: 'issue.assignee.changed', label: 'Issue assignee changed', module: 'Issue', on: 'update', watchedFields: ['assignee'], fields: [...COMMON, ...ISSUE, ...changes('assignee')] },
	{ name: 'issue.status.changed', label: 'Issue status changed', module: 'Issue', on: 'update', watchedFields: ['status', 'statusId'], fields: [...COMMON, ...ISSUE, ...changes('status')] },
	{ name: 'comment.added', label: 'Comment added', module: 'Comment', on: 'create', watchedFields: [], fields: [...COMMON, { path: 'comment.id', type: 'string' }, { path: 'comment.comment', type: 'text' }] },
	{
		name: 'schedule', label: 'Schedule', module: null, on: null, watchedFields: [], fields: [
			{ path: 'projectId', type: 'string' },
			{ path: 'occurredAt', type: 'datetime' },
			{ path: 'schedule.cron', type: 'string' },
			{ path: 'schedule.firedAt', type: 'datetime' }
		]
	}
];

/**
 * The read-only trigger catalog: GET /workflowevent lists every trigger, with the trigger kind as its id
 *
 * @method register
 * @param {Object} server
 * @public
 */
export function register(server) {
	server.get('/workflowevent', () => ({
		data: EVENTS.map(event => ({ type: 'workflowevent', id: event.name, attributes: event })),
		meta: { count: EVENTS.length }
	}));
}
