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
 * Builds the full URL for one milestone overview request.
 *
 * @param {string} milestoneId
 * @return {string}
 */
function buildMilestoneOverviewUrl(milestoneId) {
	let apiRoot = `${ENV.api.host}/api/v${ENV.api.version}/milestoneoverview`;
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
 * Loads overview JSON for one milestone (Bearer auth).
 *
 * @param {string} milestoneId
 * @param {string} accessToken Bearer token (no `Bearer ` prefix)
 * @return {Promise<Object|null>} Parsed JSON, or `null` if missing args, HTTP error, or network failure
 */
export async function fetchMilestoneOverview(milestoneId, accessToken) {
	if (!milestoneId || !accessToken) {
		return null;
	}
	let requestUrl = buildMilestoneOverviewUrl(milestoneId);
	let authHeaders = { Authorization: `Bearer ${accessToken}` };

	try {
		let httpResponse = await fetch(requestUrl, { headers: authHeaders });
		if (!httpResponse.ok) {
			Logger.warn(
				`milestone-overview-api: GET overview failed for milestone ${milestoneId} (HTTP ${httpResponse.status})`
			);
			return null;
		}
		return await httpResponse.json();
	} catch (error) {
		Logger.error('milestone-overview-api: GET overview threw', error);
		return null;
	}
}

/**
 * Loads overviews for many milestones concurrently (same semantics as {@link fetchMilestoneOverview}).
 * Entries without an `id` are skipped.
 *
 * @param {Array<{ id: string }>} milestones
 * @param {string} accessToken
 * @return {Promise<Array<{ id: string, overview: Object|null }>>}
 */
export async function fetchMilestoneOverviewsBulk(milestones, accessToken) {
	let milestonesWithIds = (milestones || []).filter((milestone) => milestone?.id);
	if (milestonesWithIds.length === 0) {
		return [];
	}
	return Promise.all(
		milestonesWithIds.map(async (milestone) => {
			let overviewJson = await fetchMilestoneOverview(
				milestone.id,
				accessToken
			);
			return { id: milestone.id, overview: overviewJson };
		})
	);
}
