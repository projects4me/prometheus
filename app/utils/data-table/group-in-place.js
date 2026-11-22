/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Groups tree rows for AppUi::DataTable while keeping the rows' positions.
 *
 * A group is placed where its first row appears and collects every row with its key, in order. A row whose key is
 * null, undefined or empty is not grouped: it becomes a plain section at its own position, so it can sit between
 * two groups. Consecutive ungrouped rows share one plain section.
 *
 * @method groupInPlace
 * @param {Array} items The flattened, ordered rows
 * @param {Object} option {groupKey(record), groupLabel(key)}
 * @return {Array} [{key, label, items, count}] for groups and [{plain: true, items}] for ungrouped rows
 */
export function groupInPlace(items, option) {
	if (!option || typeof option.groupKey !== 'function') {
		return [{ plain: true, items: [...(items || [])] }];
	}

	const groups = new Map();
	const sections = [];

	(items || []).forEach((item) => {
		let key = option.groupKey(item);
		if (key === undefined || key === null || key === '') {
			let last = sections[sections.length - 1];
			if (last && last.plain) {
				last.items.push(item);
			} else {
				sections.push({ plain: true, items: [item] });
			}
			return;
		}

		let group = groups.get(key);
		if (!group) {
			const label = option.groupLabel ? option.groupLabel(key) : String(key);
			group = { key, label, items: [], count: 0 };
			groups.set(key, group);
			sections.push(group);
		}
		group.items.push(item);
		group.count++;
	});

	return sections;
}
