/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The count source: one `conversationroomcount` query for any number of rooms. This is the only place that knows
 * where the counts come from.
 *
 * @method fetchRoomCounts
 * @param {Object} store the Ember Data store
 * @param {Array<String>} roomIds
 * @returns {Promise<Object>} `{ [roomId]: { commentCount, agreeCount, disagreeCount } }`
 */
export async function fetchRoomCounts(store, roomIds) {
	if (!roomIds.length) {
		return {};
	}
	let records = await store.query('conversationroomcount', {
		query: `(Conversationroomcount.id CONTAINS ${roomIds.map((id) => `'${id}'`).join(',')})`,
		limit: -1
	});
	return Object.fromEntries(
		records.slice().map((record) => [
			record.id,
			{
				commentCount: Number(record.commentCount) || 0,
				agreeCount: Number(record.agreeCount) || 0,
				disagreeCount: Number(record.disagreeCount) || 0
			}
		])
	);
}
