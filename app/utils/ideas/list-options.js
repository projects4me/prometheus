/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { DEFAULT_SORT } from 'prometheus/utils/idea/browser-defaults';

/**
 * The sort and group definitions of the idea browser's QuickList, as pure functions
 *
 * @module Utils.Ideas
 */

/**
 * The sort options of the list menu
 *
 * @method buildSortOptions
 * @param {Object} intl The intl service
 * @returns {Array}
 */
export function buildSortOptions(intl) {
    return [
        { key: 'Idea.dateModified', label: intl.t('views.app.idea.browser.sort.dateModified') },
        { key: 'Idea.dateCreated', label: intl.t('views.app.idea.browser.sort.dateCreated') },
        { key: 'Idea.title', label: intl.t('views.app.idea.browser.sort.title') }
    ];
}

/**
 * Maps the creator id of each idea to the creator's name
 *
 * @method buildCreators
 * @param {Array} ideas The listed ideas
 * @returns {Map}
 */
export function buildCreators(ideas) {
    return new Map(ideas.map(idea => [String(idea.createdUser), idea.belongsTo('createdBy').value()?.name]));
}

/**
 * The group options of the list menu
 *
 * @method buildGroupOptions
 * @param {Object} deps
 * @param {Object} deps.intl The intl service
 * @param {Object} deps.progress The plan progress by idea id
 * @param {Map} deps.creators The creator names by creator id
 * @returns {Array}
 */
export function buildGroupOptions({ intl, progress, creators }) {
    return [
        { key: 'none', label: intl.t('views.app.idea.browser.group.none') },
        {
            key: 'planStatus',
            label: intl.t('views.app.idea.browser.group.planStatus'),
            groupKey: idea => progress[idea.id]?.label ?? null,
            groupLabel: key => intl.t(key)
        },
        {
            key: 'createdBy',
            label: intl.t('views.app.idea.browser.group.createdBy'),
            groupKey: idea => idea.createdUser,
            groupLabel: key => creators.get(String(key)) || intl.t('views.app.idea.browser.unknownUser')
        }
    ];
}

/**
 * The sort of the list query: grouping by creator sorts by the creator first, so the groups continue across pages.
 *
 * @method buildSort
 * @param {Object} options
 * @param {String} [options.sort] The chosen sort field
 * @param {String} [options.group] The grouping of the list
 * @returns {String}
 */
export function buildSort({ sort, group } = {}) {
    let field = sort || DEFAULT_SORT;
    return group === 'createdBy' ? `Idea.createdUser,${field}` : field;
}
