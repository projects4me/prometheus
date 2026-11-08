/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The issue statuses the fixture records use (the issue status classes).
 *
 * @property QUICK_LIST_FIXTURE_STATUSES
 * @type {Array}
 */
export const QUICK_LIST_FIXTURE_STATUSES = [
	'new',
	'in_progress',
	'in_review',
	'pending',
	'done',
	'wont_fix',
	'deferred',
	'feedback',
];

export const QUICK_LIST_FIXTURE_CREATORS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Margaret Hamilton'];

const TOPICS = [
	'Login form', 'Board filters', 'Email digest', 'Export to CSV', 'Dark theme', 'Release notes',
	'Time tracking', 'Role editor', 'Search syntax', 'Mobile layout', 'Webhook retries', 'Audit trail',
	'Saved searches', 'Gantt zoom', 'File uploads', 'Idea browser', 'Milestone burndown', 'API tokens',
	'Keyboard shortcuts', 'Import wizard', 'Notification centre', 'Workflow editor', 'Sprint planning',
	'Comment mentions', 'Avatar cropping', 'Language switcher', 'Backup schedule', 'Status colours',
	'Dashboard widgets', 'Password policy', 'Bulk edit', 'Team calendar', 'Estimates report',
	'Label manager', 'Session timeout', 'Print styles', 'Empty states', 'Pagination limits',
	'Deep links', 'Inline editing', 'Drag and drop', 'Custom fields', 'Archive rules',
];

export const QUICK_LIST_FIXTURE_TAGS = ['ui', 'api', 'bug', 'idea', 'docs', 'urgent', 'design'];

const DAY = 24 * 60 * 60 * 1000;
const BASE = Date.UTC(2026, 0, 5, 9, 0, 0);

/**
 * Builds the deterministic fixture: 45 records with a title, a status, a creator, created and updated
 * dates (ISO strings) and tags. The values cycle with different strides so every grouping and sort
 * shows a spread.
 *
 * @method buildQuickListFixture
 * @return {Array} of `{ id, title, status, creator, created, updated, tags }`
 */
export function buildQuickListFixture() {
	return Array.from({ length: 45 }, (_, i) => {
		let created = BASE + i * 3 * DAY;
		let updated = created + ((i * 7) % 11) * DAY + DAY;
		return {
			id: String(i + 1),
			title: TOPICS[i % TOPICS.length],
			status: QUICK_LIST_FIXTURE_STATUSES[(i * 3) % QUICK_LIST_FIXTURE_STATUSES.length],
			creator: QUICK_LIST_FIXTURE_CREATORS[(i * 2) % QUICK_LIST_FIXTURE_CREATORS.length],
			created: new Date(created).toISOString(),
			updated: new Date(updated).toISOString(),
			tags: [QUICK_LIST_FIXTURE_TAGS[i % QUICK_LIST_FIXTURE_TAGS.length], QUICK_LIST_FIXTURE_TAGS[(i * 3 + 1) % QUICK_LIST_FIXTURE_TAGS.length]].filter((t, n, all) => all.indexOf(t) === n),
		};
	});
}
