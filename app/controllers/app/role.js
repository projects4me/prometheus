/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { allSettled } from 'rsvp';
import UrlState from 'prometheus/utils/state/url-state';
import ListLoader from 'prometheus/utils/state/list-loader';
import {
    DEFAULT_PAGE, DEFAULT_SORT, DEFAULT_ORDER, DEFAULT_GROUP, PAGE_SIZE, BROWSER_PARAMS
} from 'prometheus/utils/role/browser-defaults';
import { buildRoleListRequest, buildUserrolesRequest } from 'prometheus/utils/role/browser-requests';
import { toArray } from 'prometheus/utils/array/to-array';
import {
    TIERS, accessTier, accessSplit, coverageByRole, membersByRole, roleInitials, toCoverageEntries, userroleRoleId, isUnloaded
} from 'prometheus/utils/role/access';

const SAVED_SEARCH_MESSAGES = 'views.app.issue.list.savedsearch';
const LIST_ROUTE = 'app.role';
const INDEX_ROUTE = 'app.role.index';
const PAGE_ROUTE = 'app.role.page';

/**
 * The controller of the role browser: the page of roles listed beside the open role, with the access coverage and
 * members of each listed role, its search, paging, sort and grouping, and the add-role dialog.
 *
 * @class AppRoleController
 * @namespace Prometheus.Controllers
 * @module App.Role
 * @extends PrometheusCreateController
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRoleController extends PrometheusCreateController {
    /**
     * The saved searches service.
     *
     * @property savedSearch
     * @type Ember.Service
     * @public
     */
    @service savedSearch;

    /**
     * The query params of the role browser, all kept without refreshing the route
     *
     * @property queryParams
     * @type Array
     * @public
     */
    queryParams = ['query', 'searchId', 'page', 'sort', 'order', 'group'];

    /**
     * The Gaia query the list is narrowed by, empty for none
     *
     * @property query
     * @type String
     * @public
     */
    @tracked query = '';

    /**
     * The id of the saved search the query came from, null for none
     *
     * @property searchId
     * @type String
     * @public
     */
    @tracked searchId = null;

    /**
     * The page of the role list, 1 based
     *
     * @property page
     * @type Number
     * @public
     */
    @tracked page = DEFAULT_PAGE;

    /**
     * The field the roles are sorted by on the server
     *
     * @property sort
     * @type String
     * @public
     */
    @tracked sort = DEFAULT_SORT;

    /**
     * The direction of the sort, ASC or DESC
     *
     * @property order
     * @type String
     * @public
     */
    @tracked order = DEFAULT_ORDER;

    /**
     * How the loaded page is grouped: none or tier (client side, only the loaded page)
     *
     * @property group
     * @type String
     * @public
     */
    @tracked group = DEFAULT_GROUP;

    /**
     * The number of roles a page holds
     *
     * @property pageSize
     * @type Number
     * @public
     */
    pageSize = PAGE_SIZE;

    /**
     * The search, page, sort, order and group of the browser, kept in the URL; a change that alters the list request
     * reloads only the list
     *
     * @property urlState
     * @type UrlState
     * @public
     */
    urlState;

    /**
     * The page of roles the browser lists, with its loading flag, error and retry
     *
     * @property roleList
     * @type ListLoader
     * @public
     */
    roleList;

    /**
     * The roles created here since the list was last loaded, listed before the loaded page until the next load
     *
     * @property addedRoles
     * @type Array
     * @private
     */
    @tracked addedRoles = [];

    /**
     * The action permissions of the listed roles as coverage entries `{ roleId, resourceName, allowed }`
     *
     * @property allPermissions
     * @type Array
     * @public
     */
    @tracked allPermissions = [];

    /**
     * The user assignments of the listed roles, with their users
     *
     * @property allUserroles
     * @type Array
     * @public
     */
    @tracked allUserroles = [];

    /**
     * The ids of the listed roles whose coverage and members have loaded
     *
     * @property detailsLoadedIds
     * @type Set
     * @public
     */
    @tracked detailsLoadedIds = new Set();

    /**
     * Counts the detail loads so that only the latest one fills the coverage and members
     *
     * @property detailsSequence
     * @type Number
     * @private
     */
    detailsSequence = 0;

    /**
     * The id of the role open on the page route, null on the index
     *
     * @property selectedRoleId
     * @type String
     * @public
     */
    @tracked selectedRoleId = null;

    /**
     * The unsaved role the add-role dialog fills, set by the route
     *
     * @property newRole
     * @type Prometheus.Models.Role
     * @public
     */
    @tracked newRole = null;

    /**
     * Whether the add-role dialog is open
     *
     * @property addRoleDialog
     * @type Boolean
     * @public
     */
    @tracked addRoleDialog = false;

    /**
     * The ezSearch schema of the roles, loaded by the route
     *
     * @property querySchema
     * @type Object
     * @public
     */
    @tracked querySchema = null;

    /**
     * The saved searches of the user for the roles, loaded by the route; always replaced, never mutated
     *
     * @property savedsearches
     * @type Array
     * @public
     */
    @tracked savedsearches = [];

    /**
     * The unsaved record the save dialog names
     *
     * @property newSavedsearch
     * @type Object
     * @public
     */
    @tracked newSavedsearch = null;

    /**
     * Whether the save search dialog is open
     *
     * @property saveSearchDialog
     * @type Boolean
     * @public
     */
    @tracked saveSearchDialog = false;

    /**
     * The query the save dialog shows
     *
     * @property saveSearchQuery
     * @type String
     * @public
     */
    @tracked saveSearchQuery = '';

    /**
     * The validation of the add-role dialog
     *
     * @property metadata
     * @type Object
     * @public
     */
    metadata = {
        sections: [
            {
                name: 'roleCreate',
                fields: [
                    {
                        name: 'name',
                        validations: { default: { type: 'string', rules: [{ name: 'required' }] } }
                    },
                    {
                        name: 'description',
                        validations: { default: { type: 'string', rules: [{ name: 'required' }] } }
                    }
                ]
            }
        ]
    };

    /**
     * Builds the validation schema, the list loader and the URL state; a param change that alters the list request
     * reloads the list
     *
     * @constructor
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
        this.roleList = new ListLoader({
            store: this.store,
            modelName: 'role',
            pageSize: this.pageSize,
            owner: this,
            buildRequest: values => buildRoleListRequest(values)
        });
        this.urlState = new UrlState(this, { schema: BROWSER_PARAMS, routeName: LIST_ROUTE });
        this.urlState.onChange(values => this.paramsChanged(values));
    }

    /**
     * The sort options of the list menu
     *
     * @property sortOptions
     * @type Array
     * @public
     */
    get sortOptions() {
        return [
            { key: 'Role.name', label: this.intl.t('views.app.role.browser.sort.name') },
            { key: 'Role.dateModified', label: this.intl.t('views.app.role.browser.sort.dateModified') }
        ];
    }

    /**
     * The group options of the list menu: none, or the access tier of the loaded page
     *
     * @property groupOptions
     * @type Array
     * @public
     */
    get groupOptions() {
        return [
            { key: 'none', label: this.intl.t('views.app.role.browser.group.none') },
            {
                key: 'tier',
                label: this.intl.t('views.app.role.browser.group.tier'),
                groupKey: role => this.rowsById[role.id]?.tier ?? 'none',
                groupLabel: key => this.intl.t(`views.app.role.browser.tier.${key}`)
            }
        ];
    }

    /**
     * The order in the lower case the QuickList toolbar uses
     *
     * @property listOrder
     * @type String
     * @public
     */
    get listOrder() {
        return String(this.order).toLowerCase();
    }

    /**
     * The listed roles: those created here since the last load, then the loaded page in the server's order
     *
     * @property roles
     * @type Array
     * @public
     */
    get roles() {
        let items = this.roleList.items;
        let added = this.addedRoles.filter(role => !items.some(listed => listed.id === role.id));
        return added.length ? [...added, ...items] : items;
    }

    /**
     * The roles in the order the browser shows them: grouped by tier, the tiers run from the most to the least access
     *
     * @property listedRoles
     * @type Array
     * @public
     */
    get listedRoles() {
        if (this.group !== 'tier') {
            return this.roles;
        }
        let rank = role => TIERS.indexOf(this.rowsById[role.id]?.tier ?? 'none');
        return [...this.roles].sort((a, b) => rank(a) - rank(b));
    }

    /**
     * The access coverage in percent of every listed role whose permissions loaded, by role id
     *
     * @property coverageByRole
     * @type Object
     * @public
     */
    get coverageByRole() {
        return coverageByRole(this.allPermissions);
    }

    /**
     * The members of every listed role, by role id
     *
     * @property membersByRole
     * @type Object
     * @public
     */
    get membersByRole() {
        return membersByRole(this.allUserroles);
    }

    /**
     * What a row of the browser shows for every listed role, by role id: initials, tier, the granted and denied
     * percentages, members and the modified date
     *
     * @property rowsById
     * @type Object
     * @public
     */
    get rowsById() {
        let coverage = this.coverageByRole;
        let members = this.membersByRole;
        let rows = {};
        for (let role of this.roles) {
            let id = String(role.id);
            let loaded = this.detailsLoadedIds.has(id);
            let split = accessSplit(loaded ? (coverage[id] ?? 0) : null);
            rows[role.id] = {
                initials: roleInitials(role.name),
                tier: split.known ? accessTier(split.granted) : 'none',
                loaded,
                granted: split.granted,
                denied: split.denied,
                members: members[id] || [],
                description: (role.description && String(role.description).trim()) || '',
                modified: role.dateModified || role.dateCreated || null
            };
        }
        return rows;
    }

    /**
     * Whether Gaia linked a next page of the list
     *
     * @property hasNext
     * @type Boolean
     * @public
     */
    get hasNext() {
        return this.roleList.hasNext;
    }

    /**
     * Whether the list is loading a page
     *
     * @property isListLoading
     * @type Boolean
     * @public
     */
    get isListLoading() {
        return this.roleList.isLoading;
    }

    /**
     * The error of the latest list load
     *
     * @property listError
     * @type Object
     * @public
     */
    get listError() {
        return this.roleList.error;
    }

    /**
     * Whether a page of the list has loaded and nothing is loading
     *
     * @property isListLoaded
     * @type Boolean
     * @public
     */
    get isListLoaded() {
        return Boolean(this.roleList.params) && !this.roleList.isLoading && !this.roleList.error;
    }

    /**
     * The saved searches in the shape <EzSearchCompact> expects
     *
     * @property ezSavedSearches
     * @type Array
     * @public
     */
    get ezSavedSearches() {
        return this.savedsearches.map(search => ({
            id: search.get('id'),
            name: search.get('name'),
            query: search.get('searchquery')
        }));
    }

    /**
     * Reloads the list when the changed params alter its request; grouping only regroups the page
     *
     * @method paramsChanged
     * @param {Object} values The current params
     * @returns {Promise|void}
     * @private
     */
    paramsChanged(values) {
        if (this.roleList.params && this.isSameRequest(values, this.roleList.params)) {
            return;
        }
        return this.loadList(values);
    }

    /**
     * Whether two sets of params send the same list request
     *
     * @method isSameRequest
     * @param {Object} a
     * @param {Object} b
     * @returns {Boolean}
     * @private
     */
    isSameRequest(a, b) {
        return JSON.stringify(buildRoleListRequest(a)) === JSON.stringify(buildRoleListRequest(b));
    }

    /**
     * Shows the first page the route loaded; a page that failed to load is loaded again here, so the list shows its
     * error and retry
     *
     * @method showFirstPage
     * @param {Object} values The params the page was loaded for
     * @param {Object} firstPage `{ records }` or `{ error }`
     * @returns {Promise}
     * @public
     */
    showFirstPage(values, firstPage) {
        this.addedRoles = [];
        if (firstPage?.error) {
            return this.loadList(values);
        }
        this.roleList.seed(firstPage?.records, values);
        return this.loadRoleDetails(this.roles);
    }

    /**
     * Loads the page of the list for the params, opens its first role when none is open, then loads the coverage
     * and members of its roles
     *
     * @method loadList
     * @param {Object} values
     * @returns {Promise}
     * @public
     */
    async loadList(values) {
        this.addedRoles = [];
        return this.afterListLoad(await this.roleList.run(values));
    }

    /**
     * Loads the current page of the list again; the retry of the list error and the reload after a create or delete
     *
     * @method reloadList
     * @returns {Promise}
     * @public
     */
    @action
    async reloadList() {
        return this.afterListLoad(await this.roleList.retry());
    }

    /**
     * Opens the first listed role when none is open and loads the coverage and members of the listed roles
     *
     * @method afterListLoad
     * @param {Array|undefined} records The loaded page, undefined when a newer load replaced it or it failed
     * @returns {Promise}
     * @private
     */
    async afterListLoad(records) {
        if (!records || this.isDestroying || this.isDestroyed) {
            return;
        }
        this.openFirstRole();
        await this.loadRoleDetails(this.roles);
    }

    /**
     * Opens the first listed role when the roles area shows none, replacing the history entry so Back does not
     * return to the empty list; it never moves the user away from an open role
     *
     * @method openFirstRole
     * @returns {void}
     * @public
     */
    openFirstRole() {
        let first = this.roles[0];
        if (first && !this.selectedRoleId && this.router.currentRouteName === INDEX_ROUTE) {
            this.router.replaceWith(PAGE_ROUTE, first.id);
        }
    }

    /**
     * Loads the permissions of every given role (one query per role, as the permission API needs the roleId) and
     * the user assignments of all of them with their users, then shows their coverage and members
     *
     * @method loadRoleDetails
     * @param {Array} roles
     * @returns {Promise}
     * @public
     */
    async loadRoleDetails(roles) {
        let sequence = ++this.detailsSequence;
        let roleIds = roles.map(role => String(role.id));
        let request = buildUserrolesRequest(roleIds);
        let [userroles, ...permissions] = await allSettled([
            request ? this.store.query('userrole', request) : Promise.resolve([]),
            ...roleIds.map(roleId => this.store.query('permission', { roleId }))
        ]);
        if (this.isDestroying || this.isDestroyed || sequence !== this.detailsSequence) {
            return;
        }
        let entries = [];
        permissions.forEach((result, index) => {
            if (result.state === 'fulfilled') {
                entries.push(...toCoverageEntries(roleIds[index], result.value));
            }
        });
        if (userroles.state === 'rejected') {
            this.errorManager.handleError(userroles.reason, { moduleName: 'role' });
        }
        this.allPermissions = entries;
        this.allUserroles = userroles.state === 'fulfilled' ? toArray(userroles.value) : [];
        this.detailsLoadedIds = new Set(roleIds);
    }

    /**
     * Replaces the coverage entries of one role, after its permissions were saved on the role page
     *
     * @method syncRoleCoverage
     * @param {String} roleId
     * @param {Array} permissions Permission records or plain entries
     * @returns {void}
     * @public
     */
    syncRoleCoverage(roleId, permissions) {
        let id = String(roleId);
        let retained = this.allPermissions.filter(entry => String(entry.roleId) !== id);
        this.allPermissions = [...retained, ...toCoverageEntries(id, permissions)];
        this.detailsLoadedIds = new Set([...this.detailsLoadedIds, id]);
    }

    /**
     * Replaces the members of one role, after its members were changed on the role page
     *
     * @method syncRoleMembers
     * @param {String} roleId
     * @param {Array} userroles The role's user assignments with their users
     * @returns {void}
     * @public
     */
    syncRoleMembers(roleId, userroles) {
        let id = String(roleId);
        // a removed assignment is unloaded once its delete is saved: drop it rather than read its role
        let retained = this.allUserroles.filter(userrole => !isUnloaded(userrole) && userroleRoleId(userrole) !== id);
        this.allUserroles = [...retained, ...toArray(userroles)];
    }

    /**
     * Reloads the list after a role was deleted on the role page
     *
     * @method roleDeleted
     * @param {String} roleId
     * @returns {Promise}
     * @public
     */
    async roleDeleted(roleId) {
        this.addedRoles = this.addedRoles.filter(role => String(role.id) !== String(roleId));
        if (String(this.selectedRoleId) === String(roleId)) {
            this.selectedRoleId = null;
        }
        await this.reloadList();
    }

    /**
     * Sorts the list by a field; the modified date starts with the newest first, the name from A to Z
     *
     * @method sortList
     * @param {String} key The sort field
     * @param {String} order asc or desc as the toolbar sends it
     * @returns {void}
     * @public
     */
    @action
    sortList(key, order) {
        let next = key === this.sort ? order : key === 'Role.name' ? 'asc' : 'desc';
        this.urlState.set({ sort: key, order: next.toUpperCase() });
    }

    /**
     * Groups the loaded page; the request does not change, so the page stays
     *
     * @method groupList
     * @param {String} key none or tier
     * @returns {void}
     * @public
     */
    @action
    groupList(key) {
        this.urlState.set({ group: key, page: this.page });
    }

    /**
     * Opens a page of the list
     *
     * @method changePage
     * @param {Number} page
     * @returns {void}
     * @public
     */
    @action
    changePage(page) {
        this.urlState.set({ page });
    }

    /**
     * Runs a query from ezSearch; only the list reloads for it
     *
     * @method applyQuery
     * @param {String} query The Gaia query, empty for none
     * @public
     */
    @action
    applyQuery(query) {
        this.urlState.set({ query: query || '' });
    }

    /**
     * Marks a saved search as the active one, or clears the mark; its query arrives through applyQuery
     *
     * @method selectSavedSearch
     * @param {Object|null} search The picked item or null
     * @public
     */
    @action
    selectSavedSearch(search) {
        this.searchId = search ? String(search.id) : null;
    }

    /**
     * Opens the save dialog for the query ezSearch hands over
     *
     * @method showEzSaveSearchDialog
     * @param {String} query
     * @public
     */
    @action
    showEzSaveSearchDialog(query) {
        this.saveSearchQuery = query;
        this.saveSearchDialog = true;
    }

    /**
     * Closes the save dialog
     *
     * @method removeSaveSearchDialog
     * @public
     */
    @action
    removeSaveSearchDialog() {
        this.saveSearchDialog = false;
    }

    /**
     * Saves the query of the dialog as a saved search of the roles
     *
     * @method saveEzSearch
     * @returns {Promise}
     * @public
     */
    @action
    async saveEzSearch() {
        let query = this.saveSearchQuery;
        if (!query) {
            this.notify('error', this.intl.t(`${SAVED_SEARCH_MESSAGES}.missing`));
            this.removeSaveSearchDialog();
            return;
        }
        try {
            let data = await this.savedSearch.create(this.newSavedsearch, { relatedTo: 'role', query });
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.savedsearches = [...this.savedsearches, data];
            this.newSavedsearch = this.store.createRecord('savedsearch');
            this.notify('success', this.intl.t(`${SAVED_SEARCH_MESSAGES}.added`, { name: data.get('name'), htmlSafe: true }));
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
        }
        if (!this.isDestroying && !this.isDestroyed) {
            this.removeSaveSearchDialog();
        }
    }

    /**
     * Replaces the query of a saved search with the one ezSearch hands over
     *
     * @method updateEzSavedSearch
     * @param {Object} search The saved search item
     * @param {String} query
     * @returns {Promise}
     * @public
     */
    @action
    async updateEzSavedSearch(search, query) {
        let record = this.savedsearches.find(item => String(item.get('id')) === String(search.id));
        if (!record) {
            return;
        }
        try {
            await this.savedSearch.update(record, query);
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.savedsearches = [...this.savedsearches];
            this.notify('success', this.intl.t(`${SAVED_SEARCH_MESSAGES}.updated`, { name: record.get('name'), htmlSafe: true }));
        } catch (error) {
            record.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
        }
    }

    /**
     * Shows the add-role dialog
     *
     * @method showAddRoleDialog
     * @public
     */
    @action
    showAddRoleDialog() {
        this.addRoleDialog = true;
    }

    /**
     * Hides the add-role dialog
     *
     * @method removeModal
     * @public
     */
    @action
    removeModal() {
        if (this.isDestroyed || this.isDestroying) {
            return;
        }
        this.addRoleDialog = false;
    }

    /**
     * Saves the role of the add-role dialog, reloads the listed page with the new role in it and opens it
     *
     * @method addRole
     * @returns {Promise}
     * @public
     */
    @action
    async addRole() {
        Logger.debug('AppRoleController:addRole');
        let newRole = this.newRole;
        let validation = await this.validate(newRole, 'roleCreate');
        if (!validation.isValid) {
            this.notify('error', this._buildMessages(validation.errors, 'role'));
            return false;
        }
        let role;
        try {
            role = await newRole.save();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'role' });
            return false;
        }
        if (this.isDestroying || this.isDestroyed) {
            return false;
        }
        this.notify('success', this.intl.t('views.app.role.created', { name: role.name }));
        this.removeModal();
        this.newRole = this.store.createRecord('role', {});
        this.addedRoles = [role, ...this.addedRoles];
        this.router.transitionTo(PAGE_ROUTE, role.id);
        await this.reloadList();
        return false;
    }

    /**
     * Puts the browser back to its defaults and drops the listed page, when the roles area is left, so the next
     * visit starts clean
     *
     * @method resetBrowser
     * @returns {void}
     * @public
     */
    resetBrowser() {
        UrlState.resetController(this);
        this.roleList.reset();
        this.detailsSequence++;
        this.addedRoles = [];
        this.allPermissions = [];
        this.allUserroles = [];
        this.detailsLoadedIds = new Set();
        this.selectedRoleId = null;
        this.searchId = null;
    }

    /**
     * Posts a message to the user
     *
     * @method notify
     * @param {String} type
     * @param {String|Object} message
     * @private
     */
    notify(type, message) {
        new Messenger().post({ message, type, showCloseButton: true });
    }
}
