/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Helpers for the milestone overview REST endpoint (`/milestoneoverview/:id`).
 * Used by the dashboard widget, task board, and any other caller that needs the same
 * payload shape and time aggregation rules — not Ember Data.
 *
 * @module Utils.MilestoneOverviewApi
 */

import ENV from 'prometheus/config/environment';
import DateUtils from 'prometheus/utils/date';
import Logger from 'js-logger';

/** Work-day length used when turning API `days` into hours (aligned with task board timelog rules). */
const WORK_HOURS_PER_DAY = 8;

const MINUTES_PER_HOUR = 60;

const QUERY_INCLUDE_HOURS = 'includeHours=true';

/**
 * Whether the object looks like a flat overview payload (has numeric issue counts).
 *
 * @param {*} value
 * @return {boolean}
 */
function isFlatOverviewShape(value) {
	if (value == null || typeof value !== 'object') {
		return false;
	}
	return (
		typeof value.openIssues === 'number' || typeof value.closedIssues === 'number'
	);
}

/**
 * Builds the relative URL for one milestone overview request.
 *
 * @param {string} milestoneId
 * @return {string}
 */
function buildMilestoneOverviewUrl(milestoneId) {
	let apiRoot = `/api/v${ENV.api.version}/milestoneoverview`;
	return `${apiRoot}/${milestoneId}?${QUERY_INCLUDE_HOURS}`;
}

/**
 * Normalizes API JSON into a single plain object the UI can read.
 * Supports a flat body or a JSON:API-style `{ data: { attributes, ... } }` envelope.
 *
 * @param {*} rawResponse Body from `response.json()` or equivalent
 * @return {Object|null} Usable overview fields, or `null` if input is not an object
 */
export function unwrapOverviewPayload(rawResponse) {
	if (rawResponse == null || typeof rawResponse !== 'object') {
		return null;
	}
	if (isFlatOverviewShape(rawResponse)) {
		return rawResponse;
	}
	let dataEnvelope = rawResponse.data;
	if (!dataEnvelope || typeof dataEnvelope !== 'object') {
		return rawResponse;
	}
	if (
		dataEnvelope.attributes &&
		typeof dataEnvelope.attributes === 'object'
	) {
		return { ...dataEnvelope.attributes, ...dataEnvelope };
	}
	if (isFlatOverviewShape(dataEnvelope)) {
		return dataEnvelope;
	}
	return rawResponse;
}

/**
 * Turns API time segments (`days`, `hours`, `minutes`) into normalized `{ hours, minutes }`.
 * Days are converted using {@link WORK_HOURS_PER_DAY} hours per day before rolling minutes.
 *
 * @param {Object} [timeSegment] e.g. `{ days: 0, hours: 8, minutes: 60 }`
 * @return {{ hours: number, minutes: number }}
 */
export function aggregateTimeSegment(timeSegment) {
	if (!timeSegment) {
		return { hours: 0, minutes: 0 };
	}
	let dayCount = parseInt(timeSegment.days, 10) || 0;
	let hourCount = parseInt(timeSegment.hours, 10) || 0;
	let minuteCount = parseInt(timeSegment.minutes, 10) || 0;
	let totalMinutesFromParts =
		dayCount * WORK_HOURS_PER_DAY * MINUTES_PER_HOUR +
		hourCount * MINUTES_PER_HOUR +
		minuteCount;
	return DateUtils.normalizeMinutes(totalMinutesFromParts);
}

/**
 * Loads overviews for many milestones in one bulk request (through the adapter, so token refresh applies).
 * Entries without an `id` are skipped; a failed overview comes back as `null`.
 *
 * @param {Object} bulk The bulk service
 * @param {Array<{ id: string }>} milestones
 * @return {Promise<Array<{ id: string, overview: Object|null }>>}
 */
export async function fetchMilestoneOverviewsBulk(bulk, milestones) {
	let milestonesWithIds = (milestones || []).filter((milestone) => milestone?.id);
	if (milestonesWithIds.length === 0) {
		return [];
	}
	let results = await bulk.query(
		milestonesWithIds.map((milestone) => ({
			id: String(milestone.id),
			url: buildMilestoneOverviewUrl(milestone.id),
		}))
	);
	return milestonesWithIds.map((milestone) => {
		let result = results[String(milestone.id)];
		if (!result || result.error) {
			Logger.warn(`milestone-overview-api: overview failed for milestone ${milestone.id}`);
			return { id: milestone.id, overview: null };
		}
		return { id: milestone.id, overview: result.body ?? null };
	});
}
