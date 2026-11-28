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
	 * The project's other tag with this name, whatever its letter case: the target a rename would merge into.
	 *
	 * @method findOther
	 * @param {String|Number} projectId
	 * @param {String} name
	 * @param {Tag} tag the tag being renamed, never its own match
	 * @return {Promise<Tag|null>}
	 */
	async findOther(projectId, name, tag) {
		let text = clean(name);
		if (!text) {
			return null;
		}
		return this._find(projectId, text, tag);
	}

	/**
	 * Renames the tag for the whole project.
	 *
	 * @method rename
	 * @param {Tag} tag
	 * @param {String} name
	 * @return {Promise<Tag>}
	 */
	async rename(tag, name) {
		tag.tag = clean(name);
		try {
			return await tag.save();
		} catch (error) {
			tag.rollbackAttributes();
			throw error;
		}
	}

	/**
	 * Merges the tag into another one of the project: Gaia moves its records to the target and deletes the tag.
	 *
	 * @method merge
	 * @param {Tag} tag
	 * @param {Tag} target
	 * @return {Promise<Tag>} the target
	 */
	async merge(tag, target) {
		let adapter = this.store.adapterFor('tag');
		await adapter.ajax(adapter.buildURL('tag', tag.id), 'PATCH', {
			data: { data: { type: 'tags', id: tag.id, attributes: { mergeInto: String(target.id) } } }
		});
		tag.unloadRecord();
		return target;
	}

	/**
	 * Deletes the tag for the whole project; Gaia removes it from its records.
	 *
	 * @method remove
	 * @param {Tag} tag
	 * @return {Promise<void>}
	 */
	async remove(tag) {
		try {
			await tag.destroyRecord();
		} catch (error) {
			tag.rollbackAttributes();
			throw error;
		}
	}

	/**
	 * How many issues and threads carry the tag. A count is null when Gaia gives no total.
	 *
	 * @method usage
	 * @param {Tag} tag
	 * @return {Promise<{issues: Number|null, threads: Number|null}>}
	 */
	async usage(tag) {
		let count = async (relatedTo) => {
			let result = await this.store.query('tagged', {
				query: `((Tagged.tagId : ${tag.id}) AND (Tagged.relatedTo : ${relatedTo}))`,
				limit: 1
			});
			let total = result.meta?.total;
			return total === undefined || total === null ? null : Number(total);
		};
		let [issues, threads] = await Promise.all([count('issue'), count('conversationroom')]);
		return { issues, threads };
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
	async _find(projectId, name, except) {
		let result = await this.store.query('tag', { query: this._tagQuery(projectId, name), limit: LOOKUP_LIMIT });
		let wanted = name.toLowerCase();
		return result.slice().find((tag) => tag !== except && String(tag.tag).trim().toLowerCase() === wanted) ?? null;
	}

	/**
	 * @method _tagQuery
	 * @private
	 */
	_tagQuery(projectId, text) {
		return `((Tag.projectId : ${projectId}) AND (Tag.tag CONTAINS '${clean(text)}'))`;
	}

}
