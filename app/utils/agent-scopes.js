/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { MODULE_SCOPE } from 'prometheus/utils/acl/module-types';

/**
 * The actions a permission name can end with.
 *
 * @constant ACTIONS
 * @type Array
 */
const ACTIONS = ['create', 'read', 'update', 'delete'];

/**
 * The delegation scope suggestions: a wildcard entry per module (`issue.*`) followed by its permission names
 * (`issue.read`). Free entry stays possible, so this is only a list of suggestions.
 *
 * @method scopeOptions
 * @return {Array<Object>} `{ label, value }` options
 */
export function scopeOptions() {
    let modules = Object.values(MODULE_SCOPE).flat().sort();
    return modules.flatMap((name) => [`${name}.*`, ...ACTIONS.map((action) => `${name}.${action}`)])
        .map((value) => ({ label: value, value }));
}

/**
 * Finds the suggestions that contain the typed text, adding the text itself as an entry when it isn't one yet.
 *
 * @method searchScopes
 * @param {Array<Object>} options the suggestions
 * @param {String} term what the user typed
 * @return {Array<Object>} `{ label, value }` options
 */
export function searchScopes(options, term) {
    let text = (term ?? '').trim().toLowerCase();
    if (!text) {
        return options;
    }
    let found = options.filter((option) => option.value.includes(text));
    return found.some((option) => option.value === text) ? found : [{ label: text, value: text }, ...found];
}
