/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';

const SUGGEST_LIMIT = 10;
const LOOKUP_LIMIT = 50;

/**
 * The tag text as typed by the user: trimmed, and without the characters the query language treats as syntax.
 *
 * @param {String} text
 * @return {String}
 */
function clean(text) {
	return String(text ?? '').replace(/['()]/g, ' ').trim();
}

/**
 * Data access for the tags of a project and the records they are attached to. Tags are project scoped and unique per
 * project, case-insensitively; users type them as text and this service reuses the existing tag or creates it.
 * Application layer: no UI, components ask this service and never query tags themselves.
 *
 * @class TagsService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class TagsService extends Service {
	@service store;

	/**
	 * The tags of the project that contain the text, sorted by name.
	 *
	 * @method suggest
	 * @param {String|Number} projectId
	 * @param {String} text
	 * @return {Promise<Array<Tag>>}
	 */
	async suggest(projectId, text) {
		let result = await this.store.query('tag', {
			query: this._tagQuery(projectId, text),
			sort: 'Tag.tag',
			order: 'ASC',
			limit: SUGGEST_LIMIT
		});
		return result.slice();
	}

	/**
	 * Tags the record with the text: the project's tag of that name (any letter case) is reused, or created when it is
	 * missing. When two users create the same tag at once Gaia refuses the second with a 422 (the adapter does not
	 * keep the status, so any refusal of the create counts); the lookup is then repeated and finds the tag the other
	 * user created. When it still finds nothing, the original error is thrown.
	 *
	 * @method attach
	 * @param {String|Number} projectId
	 * @param {String} relatedTo the record type, e.g. `issue` or `conversationroom`
	 * @param {String|Number} relatedId
	 * @param {String} text
	 * @return {Promise<Tagged>}
	 */
	async attach(projectId, relatedTo, relatedId, text) {
		let name = clean(text);
		let tag = await this._findOrCreate(projectId, name);
		let tagged = this.store.createRecord('tagged', {
			projectId: String(projectId),
			relatedTo,
			relatedId: String(relatedId),
			tagId: String(tag.id),
			tag
		});
		try {
			return await tagged.save();
		} catch (error) {
			tagged.unloadRecord();
			throw error;
		}
	}

	/**
	 * Removes the tag from the record it was attached to. The tag itself stays for the project.
	 *
	 * @method detach
	 * @param {Tagged} tagged
	 * @return {Promise<void>}
	 */
	async detach(tagged) {
		await tagged.destroyRecord();
	}

	/**
	 * The tag links of a record, each with its tag loaded.
	 *
	 * @method forRecord
	 * @param {String} relatedTo
	 * @param {String|Number} relatedId
	 * @return {Promise<Array<Tagged>>}
	 */
	async forRecord(relatedTo, relatedId) {
		let result = await this.store.query('tagged', {
			query: `((Tagged.relatedTo : ${relatedTo}) AND (Tagged.relatedId : ${relatedId}))`,
			rels: 'tag',
			limit: -1
		});
		return result.slice();
	}

	/**
	 * The tags of many records of one type with one request: a Map of record id (string) to its tags sorted by name.
	 * Records without tags are not in the Map.
	 *
	 * @method forRecords
	 * @param {String} relatedTo
	 * @param {Array<String|Number>} ids
	 * @return {Promise<Map<String, Array<Tag>>>}
	 */
	async forRecords(relatedTo, ids) {
		let byRecord = new Map();
		let wanted = (ids ?? []).map((id) => String(id));
		if (!wanted.length) {
			return byRecord;
		}
		let result = await this.store.query('tagged', {
			query: `((Tagged.relatedTo : ${relatedTo}) AND (Tagged.relatedId CONTAINS ${wanted.map((id) => `'${id}'`).join(',')}))`,
			rels: 'tag',
			limit: -1
		});
		for (let tagged of result.slice()) {
			let tag = await tagged.tag;
			if (!tag) {
				continue;
			}
			let key = String(tagged.relatedId);
			if (!byRecord.has(key)) {
				byRecord.set(key, []);
			}
			byRecord.get(key).push(tag);
		}
		for (let tags of byRecord.values()) {
			tags.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
		}
		return byRecord;
	}

	/**
	 * @method _findOrCreate
	 * @param {String|Number} projectId
	 * @param {String} name
	 * @return {Promise<Tag>}
	 * @private
	 */
	async _findOrCreate(projectId, name) {
		let existing = await this._find(projectId, name);
		if (existing) {
			return existing;
		}
		let tag = this.store.createRecord('tag', { projectId: String(projectId), tag: name });
		try {
			return await tag.save();
		} catch (error) {
			tag.unloadRecord();
			let winner = await this._find(projectId, name);
			if (!winner) {
				throw error;
			}
			return winner;
		}
	}

	/**
	 * The project's tag with this name, whatever its letter case.
	 *
	 * @method _find
	 * @private
	 */
	async _find(projectId, name) {
		let result = await this.store.query('tag', { query: this._tagQuery(projectId, name), limit: LOOKUP_LIMIT });
		let wanted = name.toLowerCase();
		return result.slice().find((tag) => String(tag.tag).trim().toLowerCase() === wanted) ?? null;
	}

	/**
	 * @method _tagQuery
	 * @private
	 */
	_tagQuery(projectId, text) {
		return `((Tag.projectId : ${projectId}) AND (Tag.tag CONTAINS '${clean(text)}'))`;
	}

}
