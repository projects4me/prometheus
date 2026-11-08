/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The groups of the Developer Component Library, in the order the Components
 * box shows them.
 *
 * @property GROUPS
 * @type {Array<string>}
 * @public
 */
export const GROUPS = ['Lists', 'Search', 'Forms', 'Overlays', 'Menus'];

/**
 * The registered library entries, in display order. Each entry is
 * `{ name, label, group, status, summary, usedIn, demo, doc, variants }`:
 * - `name`: url segment of the entry page (`/app/developer/components/:name`);
 * - `group`: one of `GROUPS`;
 * - `status`: `stable` or `experimental`;
 * - `usedIn`: `[{ label, route }]`, screens that use the component;
 * - `demo`: the component rendered on the entry page;
 * - `doc`: the file name of its documentation in `public/ui-docs`;
 * - `variants` (optional): a count or a list of variant labels.
 *
 * The placeholder stands in until the first real component is registered.
 *
 * @property ENTRIES
 * @type {Array<Object>}
 * @public
 */
export const ENTRIES = [
    {
        name: 'placeholder',
        label: 'Placeholder',
        group: 'Lists',
        status: 'experimental',
        summary: 'Stand-in entry until the first component is registered.',
        usedIn: [],
        demo: 'developer/placeholder-demo',
        doc: null
    },
    {
        name: 'form-fields',
        label: 'Form fields',
        group: 'Forms',
        status: 'stable',
        summary: 'The FormFields::* components every form is built from.',
        usedIn: [],
        demo: 'developer/demos/form-fields',
        doc: 'form-fields.md',
        variants: 10
    },
    {
        name: 'bootstrap-modal',
        label: 'Modal',
        group: 'Overlays',
        status: 'stable',
        summary: 'The bootstrap-modal dialog: title, confirm handling and rendering outside stacking contexts.',
        usedIn: [
            { label: 'Projects list', route: 'app.projects' }
        ],
        demo: 'developer/demos/modal',
        doc: 'modal.md'
    }
];

/**
 * Looks up and groups the entries of the Developer Component Library.
 *
 * @class ComponentRegistry
 * @namespace Prometheus.Utils.Developer
 * @module Developer
 */
export class ComponentRegistry {

    /**
     * @method constructor
     * @param {Array<Object>} entries the entries, in display order
     * @public
     */
    constructor(entries = ENTRIES) {
        this.entries = entries;
    }

    /**
     * The first registered entry, or `null` when there is none.
     *
     * @property first
     * @type {Object|null}
     * @public
     */
    get first() {
        return this.entries[0] || null;
    }

    /**
     * The entry with the given name, or `null`.
     *
     * @method find
     * @param {string} name
     * @returns {Object|null}
     * @public
     */
    find(name) {
        return this.entries.find(entry => entry.name === name) || null;
    }

    /**
     * The entries whose label or summary contains `filter` (case-insensitive),
     * grouped in `GROUPS` order. Groups without entries are dropped; entries
     * in a group that is not in `GROUPS` come last, under their own group.
     *
     * @method grouped
     * @param {string} filter
     * @returns {Array<{group: string, entries: Array<Object>}>}
     * @public
     */
    grouped(filter = '') {
        let term = String(filter || '').trim().toLowerCase();
        let matches = this.entries.filter(entry => !term
            || String(entry.label || '').toLowerCase().includes(term)
            || String(entry.summary || '').toLowerCase().includes(term));

        let order = [...GROUPS];
        matches.forEach(entry => {
            if (!order.includes(entry.group)) {
                order.push(entry.group);
            }
        });

        return order
            .map(group => ({ group, entries: matches.filter(entry => entry.group === group) }))
            .filter(section => section.entries.length > 0);
    }
}

/**
 * The application's registry.
 *
 * @property registry
 * @type {ComponentRegistry}
 * @public
 */
export default new ComponentRegistry();
