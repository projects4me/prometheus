/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Groups the loaded items by a key, keeping the first-seen order of the groups.
 *
 * Grouping works on the page the caller loaded; the caller sorts by the group field first so groups continue
 * across pages. Items whose key is null, undefined or empty fall into one group with a null key and a null label; the
 * heading component shows the translated "None" for it.
 *
 * @method groupItems
 * @param {Array} items The records to group
 * @param {Object} option {groupKey(record), groupLabel(key)}
 * @return {Array} [{key, label, items, count}]
 */
export function groupItems(items, option) {
    const groups = new Map();
    if (!option || typeof option.groupKey !== 'function') {
        return [];
    }

    (items || []).forEach((item) => {
        let key = option.groupKey(item);
        if (key === undefined || key === '') {
            key = null;
        }

        let group = groups.get(key);
        if (!group) {
            const label = key === null ? null : option.groupLabel ? option.groupLabel(key) : String(key);
            group = { key, label, items: [], count: 0 };
            groups.set(key, group);
        }
        group.items.push(item);
        group.count++;
    });

    return [...groups.values()];
}
