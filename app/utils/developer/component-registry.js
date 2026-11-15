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
export const GROUPS = ['Lists', 'Search', 'Forms', 'Overlays', 'Menus', 'Navigation', 'Display'];

/**
 * The registered library entries, in display order. Each entry is
 * `{ name, label, group, status, summary, usedIn, demo, doc, variants }`:
 * - `name`: url segment of the entry page (`/app/developer/components/:name`);
 * - `group`: one of `GROUPS`;
 * - `status`: `stable` or `experimental`;
 * - `usedIn`: `[{ label, route }]`, screens that use the component (`route` is omitted for screens that need
 *   a route parameter, which show as plain text);
 * - `demo`: the component rendered on the entry page;
 * - `doc`: the file name of its documentation in `public/ui-docs`;
 * - `variants` (optional): a count or a list of variant labels.
 *
 * @property ENTRIES
 * @type {Array<Object>}
 * @public
 */
export const ENTRIES = [
    {
        name: 'quick-list',
        label: 'QuickList',
        group: 'Lists',
        status: 'stable',
        summary: 'A narrow list of records with search, sorting, grouping, selection and paging.',
        usedIn: [{ label: 'Ideas browser', route: 'app.projects' }],
        demo: 'developer/demos/quick-list',
        doc: 'quick-list.md'
    },
    {
        name: 'list-toolbar',
        label: 'ListToolbar',
        group: 'Lists',
        status: 'experimental',
        summary: 'AppUi::ListToolbar, the top of a list page box: search and actions in the header, bulk actions and the pager below.',
        usedIn: [{ label: 'Agents list', route: 'app.agent' }, { label: 'Workflows list', route: 'app.workflow' }],
        demo: 'developer/demos/list-page',
        doc: 'list-toolbar.md'
    },
    {
        name: 'data-table',
        label: 'DataTable',
        group: 'Lists',
        status: 'experimental',
        summary: 'AppUi::DataTable, the slim list table from column descriptors, with sorting, selection and row actions reported out.',
        usedIn: [{ label: 'Agents list', route: 'app.agent' }, { label: 'Workflows list', route: 'app.workflow' }],
        demo: 'developer/demos/list-page',
        doc: 'data-table.md'
    },
    {
        name: 'pager',
        label: 'Pager',
        group: 'Lists',
        status: 'experimental',
        summary: 'AppUi::Pager, the range text and previous/next buttons of a paged list, from an offset and whether more rows exist.',
        usedIn: [{ label: 'Agents list', route: 'app.agent' }, { label: 'Workflows list', route: 'app.workflow' }, { label: 'QuickList footer' }],
        demo: 'developer/demos/pager',
        doc: 'pager.md'
    },
    {
        name: 'ez-search',
        label: 'ezSearch',
        group: 'Search',
        status: 'stable',
        summary: 'Search bar and visual query builder, as EzSearch and the EzSearchCompact multi-row and linear layouts.',
        usedIn: [
            { label: 'Issues' },
            { label: 'Projects', route: 'app.projects' },
            { label: 'Ideas' },
            { label: 'Gantt' },
            { label: 'Task Board' }
        ],
        demo: 'developer/demos/ez-search',
        doc: 'ez-search.md',
        variants: 3
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
        name: 'select',
        label: 'Select',
        group: 'Forms',
        status: 'stable',
        summary: 'AppUi::Select, the single and multiple searchable select every relate field, the header search and the project switcher render.',
        usedIn: [
            { label: 'Global search' },
            { label: 'Sidebar project switcher' },
            { label: 'Form fields relate and multi-select' }
        ],
        demo: 'developer/demos/select',
        doc: 'select.md',
        variants: ['Single', 'Multiple']
    },
    {
        name: 'modal',
        label: 'Modal',
        group: 'Overlays',
        status: 'stable',
        summary: 'AppUi::Modal on the native dialog element: title, confirm handling and rendering in the top layer.',
        usedIn: [
            { label: 'Projects list', route: 'app.projects' }
        ],
        demo: 'developer/demos/modal',
        doc: 'modal.md'
    },
    {
        name: 'dropdown',
        label: 'Dropdown',
        group: 'Menus',
        status: 'stable',
        summary: 'A button that opens a floating menu, used for saved searches and board filters.',
        usedIn: [{ label: 'ezSearch saved searches', route: 'app.projects' }],
        demo: 'developer/demos/dropdown',
        doc: 'dropdown.md'
    },
    {
        name: 'tabs',
        label: 'Tabs',
        group: 'Navigation',
        status: 'stable',
        summary: 'AdminLTE nav-tabs with their panes; the active tab is an argument and a change is an event.',
        usedIn: [{ label: 'Component Library docs', route: 'app.developer.components' }],
        demo: 'developer/demos/tabs',
        doc: 'tabs.md'
    },
    {
        name: 'box',
        label: 'Box',
        group: 'Display',
        status: 'stable',
        summary: 'AppUi::Box, the AdminLTE box with square edges: header, tools, body and footer blocks in six variants.',
        usedIn: [],
        demo: 'developer/demos/box',
        doc: 'app-ui-box.md',
        variants: ['primary', 'default', 'info', 'success', 'warning', 'danger']
    },
    {
        name: 'empty-state',
        label: 'EmptyState',
        group: 'Display',
        status: 'stable',
        summary: 'AppUi::EmptyState, the message a list or box shows when there is nothing to show: an icon, the text and an inline action.',
        usedIn: [{ label: 'QuickList and DataTable empty states' }],
        demo: 'developer/demos/empty-state',
        doc: 'app-ui-empty-state.md'
    },
    {
        name: 'avatar',
        label: 'Avatar',
        group: 'Display',
        status: 'stable',
        summary: 'AppUi::Avatar, the round picture of a user, or the agent avatar for an agent.',
        usedIn: [],
        demo: 'developer/demos/avatar',
        doc: 'app-ui-avatar.md',
        variants: ['default', 'sm', 'xs']
    },
    {
        name: 'status-label',
        label: 'Status',
        group: 'Display',
        status: 'stable',
        summary: 'AppUi::StatusLabel, an issue status as a badge: the translated name in the colour of the status.',
        usedIn: [],
        demo: 'developer/demos/status-label',
        doc: 'app-ui-status-label.md'
    },
    {
        name: 'tag',
        label: 'Tag',
        group: 'Display',
        status: 'stable',
        summary: 'AppUi::Tag, a tag or small label with square edges, in the default look of the app.',
        usedIn: [],
        demo: 'developer/demos/tag',
        doc: 'app-ui-tag.md',
        variants: ['default', 'primary', 'success', 'info', 'warning', 'danger']
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
