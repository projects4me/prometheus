/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The label of the group that holds items without a group value.
 *
 * @property NONE_LABEL
 * @type String
 */
export const NONE_LABEL = 'None';

/**
 * Groups the loaded items by a key, keeping the first-seen order of the groups.
 *
 * Grouping works on the page the caller loaded; the caller sorts by the group field first so groups continue
 * across pages. Items whose key is null, undefined or empty fall into one "None" group.
 *
 * @method groupItems
 * @param {Array} items The records to group
 * @param {Object} option {key, groupKey(record), groupLabel(key)}
 * @return {Array} [{key, label, items, count}]
 */
export function groupItems(items, option) {
    const groups = new Map();

    (items || []).forEach((item) => {
        let key = option.groupKey(item);
        if (key === undefined || key === '') {
            key = null;
        }

        let group = groups.get(key);
        if (!group) {
            const label = key === null ? NONE_LABEL : option.groupLabel ? option.groupLabel(key) : String(key);
            group = { key, label, items: [], count: 0 };
            groups.set(key, group);
        }
        group.items.push(item);
        group.count++;
    });

    return [...groups.values()];
}
