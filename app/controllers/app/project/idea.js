/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
    DEFAULT_PAGE, DEFAULT_SORT, DEFAULT_ORDER, DEFAULT_GROUP, BROWSER_PARAMS
} from 'prometheus/utils/idea/browser-defaults';
import {
    buildIdeaListRequest, buildArchivedCountRequest, buildPlansRequest
} from 'prometheus/utils/idea/browser-requests';
import { planStatusClass } from 'prometheus/utils/idea/plan-status';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import { buildSortOptions, buildGroupOptions, buildCreators } from 'prometheus/utils/ideas/list-options';
import UrlState from 'prometheus/utils/state/url-state';
import ListLoader from 'prometheus/utils/state/list-loader';

const SAVED_SEARCH_MESSAGES = 'views.app.issue.list.savedsearch';
const STORAGE_KEY = 'ideaBrowserCollapsed';
const ARCHIVED = 'archived';
const PROGRESS_STATUSES = ['proposed', 'approved', 'creating', 'created', 'failed'];

/**
 * Reads the remembered state of the idea browser, expanded when the storage is unavailable
 *
 * @return {boolean}
 */
function readCollapsed() {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
        return false;
    }
}

/**
 * The controller of the idea browser. It decides which ideas of the project are listed.
 *
 * @class Idea
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Controller
 */
export default class AppProjectIdeaController extends Controller {
    /**
     * @property hermes
     * @type Ember.Service
     * @public
     */
    @service hermes;

    /**
     * @property router
     * @type Ember.Service
     * @public
     */
    @service router;

    /**
     * @property savedSearch
     * @type Ember.Service
     * @public
     */
    @service savedSearch;

    /**
     * @property store
     * @type Ember.Service
     * @public
     */
    @service store;

    /**
     * @property intl
     * @type Ember.Service
     * @public
     */
    @service intl;

    /**
     * @property errorManager
     * @type Ember.Service
     * @public
     */
    @service errorManager;

    /**
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * True while the Start an idea form is open, so the New idea button is shown disabled
     *
     * @property isCreating
     * @type Boolean
     * @public
     */
    get isCreating() {
        return this.router.currentRouteName === 'app.project.idea.create';
    }

    /**
     * The query params of the idea area: view=plan opens the idea page in plan review mode
     *
     * @property queryParams
     * @type Array
     * @public
     */
    queryParams = ['view', 'query', 'searchId', 'page', 'sort', 'order', 'group', 'archived'];

    /**
     * The page of the idea list, 1 based
     *
     * @property page
     * @type Number
     * @default 1
     * @public
     */
    @tracked page = DEFAULT_PAGE;

    /**
     * The field the ideas are sorted by on the server
     *
     * @property sort
     * @type String
     * @default Idea.dateModified
     * @public
     */
    @tracked sort = DEFAULT_SORT;

    /**
     * The direction of the sort, ASC or DESC
     *
     * @property order
     * @type String
     * @default DESC
     * @public
     */
    @tracked order = DEFAULT_ORDER;

    /**
     * The number of ideas a page holds, -1 for all of them
     *
     * @property pageSize
     * @type Number
     * @default -1
     * @public
     */
    pageSize = 20;

    /**
     * How the loaded page is grouped: none, planStatus (client side, only the loaded page) or createdBy (the
     * server sorts by the creator first, so the groups continue across pages)
     *
     * @property group
     * @type String
     * @default 'none'
     * @public
     */
    @tracked group = DEFAULT_GROUP;

    /**
     * The sort options of the list menu
     *
     * @property sortOptions
     * @type Array
     * @public
     */
    get sortOptions() {
        return buildSortOptions(this.intl);
    }

    /**
     * The group options of the list menu
     *
     * @property groupOptions
     * @type Array
     * @public
     */
    get groupOptions() {
        return buildGroupOptions({
            intl: this.intl,
            progress: this.progressByIdea,
            creators: buildCreators(this.ideas)
        });
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
     * The view of the idea page, plan for the review mode and null for the conversation layout
     *
     * @property view
     * @type String
     * @public
     */
    @tracked view = null;

    /**
     * The query params the browser links carry, so the review mode stays when another idea is opened
     *
     * @property linkQuery
     * @type Object
     * @public
     */
    get linkQuery() {
        return { view: this.view, query: this.query, searchId: this.searchId, archived: this.archived };
    }

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
     * The search, page, sort, order, group and archived toggle of the browser, kept in the URL without refreshing
     * the route; a change that alters the list request reloads only the list
     *
     * @property urlState
     * @type UrlState
     * @public
     */
    urlState;

    /**
     * The page of ideas the browser lists, with its loading flag, error and retry
     *
     * @property ideaList
     * @type ListLoader
     * @public
     */
    ideaList;

    /**
     * The ideas saved here since the list was last loaded, listed before the loaded page until the next load
     *
     * @property addedIdeas
     * @type Array
     * @private
     */
    @tracked addedIdeas = [];

    /**
     * Counts the archived count loads so that only the latest one sets archivedTotal
     *
     * @property archivedSequence
     * @type Number
     * @private
     */
    archivedSequence = 0;

    /**
     * Builds the list loader and the URL state; a param change that alters the list request reloads the list
     *
     * @constructor
     */
    constructor() {
        super(...arguments);
        this.ideaList = new ListLoader({
            store: this.store,
            modelName: 'idea',
            pageSize: this.pageSize,
            owner: this,
            buildRequest: values => this.buildRequest(values)
        });
        this.urlState = new UrlState(this, { schema: BROWSER_PARAMS, routeName: 'app.project.idea' });
        this.urlState.onChange(values => this.paramsChanged(values));
    }

    /**
     * The list query options for the browser params, shared with the route that loads the first page
     *
     * @method buildRequest
     * @param {Object} values The query, page, sort, order, group and archived params
     * @returns {Object}
     * @public
     */
    buildRequest(values) {
        return buildIdeaListRequest(this.trackedProject.getProjectId(), values);
    }

    /**
     * Reloads the list when the changed params alter its request; grouping by plan status only regroups the page
     *
     * @method paramsChanged
     * @param {Object} values The current params
     * @returns {Promise|void}
     * @private
     */
    paramsChanged(values) {
        if (this.ideaList.params && this.isSameRequest(values, this.ideaList.params)) {
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
        return JSON.stringify(this.buildRequest(a)) === JSON.stringify(this.buildRequest(b));
    }

    /**
     * Shows the first page the route loaded and the archived count; a page that failed to load is loaded again
     * here, so the list shows its error and retry
     *
     * @method showFirstPage
     * @param {Object} values The params the page was loaded for
     * @param {Object} firstPage `{ records }` or `{ error }`
     * @param {Number} [archivedTotal]
     * @returns {Promise}
     * @public
     */
    showFirstPage(values, firstPage, archivedTotal) {
        this.planStatuses = {};
        this.loadedIdeaIds = new Set();
        this.addedIdeas = [];
        this.archivedTotal = archivedTotal ?? null;
        if (firstPage?.error) {
            return this.loadList(values);
        }
        this.ideaList.seed(firstPage?.records, values);
        return this.loadPlanStatuses(this.ideas);
    }

    /**
     * Loads the page of the list for the params, then the plan statuses of its ideas
     *
     * @method loadList
     * @param {Object} values
     * @returns {Promise}
     * @public
     */
    async loadList(values) {
        this.addedIdeas = [];
        let records = await this.ideaList.run(values);
        if (records && !this.isDestroying && !this.isDestroyed) {
            await this.loadPlanStatuses(this.ideas);
        }
    }

    /**
     * Loads the current page of the list again, then the plan statuses of its ideas; the retry of the list error
     *
     * @method reloadList
     * @returns {Promise}
     * @public
     */
    @action
    async reloadList() {
        this.addedIdeas = [];
        let records = await this.ideaList.retry();
        if (records && !this.isDestroying && !this.isDestroyed) {
            await this.loadPlanStatuses(this.ideas);
        }
    }

    /**
     * Reloads the list and the archived count, after a change that moves ideas between the listed and unlisted
     * statuses
     *
     * @method refreshList
     * @returns {Promise}
     * @public
     */
    async refreshList() {
        await Promise.all([this.reloadList(), this.loadArchivedTotal()]);
    }

    /**
     * Counts the archived ideas of the project for the footer toggle; null when they cannot be counted. Gaia sends
     * no total in the list meta, so the archived ideas are loaded without relations and counted.
     *
     * @method countArchived
     * @returns {Promise<Number|null>}
     * @public
     */
    async countArchived() {
        try {
            let ideas = await this.store.query('idea', buildArchivedCountRequest(this.trackedProject.getProjectId()));
            return ideas?.length ?? null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Counts the archived ideas again and shows the count in the footer
     *
     * @method loadArchivedTotal
     * @returns {Promise}
     * @public
     */
    async loadArchivedTotal() {
        let sequence = ++this.archivedSequence;
        let total = await this.countArchived();
        if (!this.isDestroying && !this.isDestroyed && sequence === this.archivedSequence) {
            this.archivedTotal = total;
        }
    }

    /**
     * Queries the plans of the given ideas in one request
     *
     * @method loadPlans
     * @param {Array} ideaIds
     * @returns {Promise} The plans, null when they could not be loaded
     * @public
     */
    async loadPlans(ideaIds) {
        let request = buildPlansRequest(ideaIds);
        if (!request) {
            return [];
        }
        try {
            return await this.store.query('ideaplan', request);
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
            return null;
        }
    }

    /**
     * The listed ideas: those saved here since the last load, then the loaded page in the server's order
     *
     * @property ideas
     * @type Array
     * @public
     */
    get ideas() {
        let items = this.ideaList.items;
        let added = this.addedIdeas.filter(idea => !items.some(listed => listed.id === idea.id));
        return added.length ? [...added, ...items] : items;
    }

    /**
     * The ideas that are listed in the browser
     *
     * @property listedIdeas
     * @type Array
     * @public
     */
    get listedIdeas() {
        return this.ideas;
    }

    /**
     * Whether Gaia linked a next page of the list (`meta.links.next`); the browser never asks for a total
     *
     * @property hasNext
     * @type Boolean
     * @public
     */
    get hasNext() {
        return this.ideaList.hasNext;
    }

    /**
     * Whether the list is loading a page
     *
     * @property isListLoading
     * @type Boolean
     * @public
     */
    get isListLoading() {
        return this.ideaList.isLoading;
    }

    /**
     * The error of the latest list load
     *
     * @property listError
     * @type Object
     * @public
     */
    get listError() {
        return this.ideaList.error;
    }

    /**
     * Sorts the list by a field; a date starts with the newest first, a title from A to Z
     *
     * @method sortList
     * @param {String} key The sort field
     * @param {String} order asc or desc as the toolbar sends it
     * @returns {void}
     * @public
     */
    @action
    sortList(key, order) {
        let isDate = key !== 'Idea.title';
        let next = key === this.sort ? order : isDate ? 'desc' : 'asc';
        this.urlState.set({ sort: key, order: next.toUpperCase() });
    }

    /**
     * Groups the list; grouping by creator changes the server sort, so it starts from the first page, the other
     * groupings only regroup the loaded page
     *
     * @method groupList
     * @param {String} key none, planStatus or createdBy
     * @returns {void}
     * @public
     */
    @action
    groupList(key) {
        let changesRequest = key === 'createdBy' || this.group === 'createdBy';
        this.urlState.set(changesRequest ? { group: key } : { group: key, page: this.page });
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
     * Shows or hides the archived ideas; the list query changes, so it runs again from the first page
     *
     * @method toggleArchived
     * @returns {void}
     * @public
     */
    @action
    toggleArchived() {
        this.urlState.set({ archived: !this.archived });
    }

    /**
     * Adds an idea to the list unless it is listed already (a reload may have brought it in first), a new idea has
     * no plan so it is loaded
     *
     * @method addIdea
     * @param {Prometheus.Models.Idea} idea
     * @returns {void}
     * @public
     */
    addIdea(idea) {
        if (!this.ideas.some(listed => listed.id === idea.id)) {
            // the newest idea leads the default sort, date modified newest first
            this.addedIdeas = [idea, ...this.addedIdeas];
            this.loadedIdeaIds = new Set([...this.loadedIdeaIds, idea.id]);
        }
    }

    /**
     * Registers the events that change the idea list
     *
     * @method registerHermesIntents
     * @param {String} projectId
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId) {
        this.unregisterHermesIntents();
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'idea.created': envelope => this.handleIdeaCreated(envelope),
            'idea.updated': () => this.refreshList(),
            'idea.plan.created': () => this.loadPlanStatuses(this.ideas),
            'idea.plan.status.changed': () => this.loadPlanStatuses(this.ideas)
        });
    }

    /**
     * Reloads the ideas when an idea is created, unless it is listed already. An idea created here is added
     * by the create page once it is saved, so its event finds it listed; the same user creating one in
     * another tab is not listed, so that event reloads.
     *
     * @method handleIdeaCreated
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise|void}
     * @public
     */
    handleIdeaCreated(envelope) {
        let resourceId = envelope?.resource?.id;
        if (resourceId && this.ideas.some(listed => String(listed.id) === String(resourceId))) {
            return;
        }
        return this.refreshList();
    }

    /**
     * Disposes the Hermes registration
     *
     * @method unregisterHermesIntents
     * @returns {void}
     * @public
     */
    unregisterHermesIntents() {
        this.hermesDisposer?.();
        this.hermesDisposer = null;
    }

    /**
     * Puts the browser back to its defaults and drops the listed page, when the idea area is left or the project
     * switches, so the next visit starts clean
     *
     * @method resetBrowser
     * @returns {void}
     * @public
     */
    resetBrowser() {
        UrlState.resetController(this);
        this.ideaList.reset();
        this.archivedSequence++;
        this.planSequence++;
        this.addedIdeas = [];
        this.archivedTotal = null;
        this.planStatuses = {};
        this.loadedIdeaIds = new Set();
        this.view = null;
        this.searchId = null;
        this.unregisterHermesIntents();
    }

    /**
     * The ezSearch schema of the ideas, loaded by the route
     *
     * @property querySchema
     * @type Object
     * @public
     */
    @tracked querySchema = null;

    /**
     * The saved searches of the user for the ideas, loaded by the route; always replaced, never mutated
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
     * The number of archived ideas of the project, for the footer toggle; null while unknown or searching
     *
     * @property archivedTotal
     * @type Number
     * @public
     */
    @tracked archivedTotal = null;

    /**
     * Whether a search narrows the list
     *
     * @property isSearching
     * @type Boolean
     * @public
     */
    get isSearching() {
        return Boolean(this.query);
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
     * Saves the query of the dialog as a saved search of the ideas of the project
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
            let data = await this.savedSearch.create(this.newSavedsearch, {
                relatedTo: 'idea',
                query,
                projectId: this.trackedProject.getProjectId()
            });
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.savedsearches = [...this.savedsearches, data];
            this.newSavedsearch = this.store.createRecord('savedsearch');
            this.notify('success', htmlSafe(this.intl.t(`${SAVED_SEARCH_MESSAGES}.added`, { name: data.get('name') })));
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
            this.notify('success', htmlSafe(this.intl.t(`${SAVED_SEARCH_MESSAGES}.updated`, { name: record.get('name') })));
        } catch (error) {
            record.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
        }
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

    /**
     * Disposer of the Hermes registration
     *
     * @property hermesDisposer
     * @type Function
     * @private
     */
    hermesDisposer = null;

    /**
     * Whether the idea browser is collapsed so the idea page uses the full width, remembered in localStorage
     *
     * @property browserCollapsed
     * @type Boolean
     * @public
     */
    @tracked browserCollapsed = readCollapsed();

    /**
     * The identifier of the idea that is open on the page route, null on the others
     *
     * @property selectedIdeaId
     * @type String
     * @public
     */
    @tracked selectedIdeaId = null;

    /**
     * Whether the archived ideas are listed after the open ones, kept in the URL as the archived query param
     *
     * @property archived
     * @type Boolean
     * @default false
     * @public
     */
    @tracked archived = false;

    /**
     * Whether the archived ideas are listed after the open ones
     *
     * @property showArchived
     * @type Boolean
     * @public
     */
    get showArchived() {
        return this.archived;
    }

    /**
     * The status of the latest plan by idea id, empty for an idea without a plan
     *
     * @property planStatuses
     * @type Object
     * @private
     */
    @tracked planStatuses = {};

    /**
     * Counts the plan loads so that only the latest one fills planStatuses
     *
     * @property planSequence
     * @type Number
     * @private
     */
    planSequence = 0;

    /**
     * The statuses set by a change saved here since the last plan load began, they win over the loaded ones
     *
     * @property liveStatuses
     * @type Object
     * @private
     */
    liveStatuses = {};

    /**
     * The ids of the ideas whose plan query has settled, an idea outside it without a known status shows a loading
     * label rather than brainstorming
     *
     * @property loadedIdeaIds
     * @type Set
     * @default empty
     * @public
     */
    @tracked loadedIdeaIds = new Set();

    /**
     * The progress label key and label class of every idea by idea id: archived, brainstorming without a plan,
     * otherwise the status of the latest plan
     *
     * @property progressByIdea
     * @type Object
     * @public
     */
    get progressByIdea() {
        let progress = {};
        for (let idea of this.ideas) {
            let status = this.planStatuses[idea.id];
            if (idea.status === ARCHIVED) {
                progress[idea.id] = { label: 'views.app.idea.status.archived', class: 'deferred' };
            } else if (!status && !this.loadedIdeaIds.has(idea.id)) {
                progress[idea.id] = { label: 'views.app.idea.progress.loading', class: 'default', loading: true };
            } else if (!status) {
                progress[idea.id] = { label: 'views.app.idea.progress.brainstorming', class: 'new' };
            } else {
                let known = PROGRESS_STATUSES.includes(status);
                progress[idea.id] = {
                    label: known ? `views.app.idea.progress.${status}` : `views.app.idea.plan.status.${status}`,
                    class: planStatusClass(status)
                };
            }
        }
        return progress;
    }

    /**
     * Sets the plan status of an idea, for a change saved here whose Hermes event is not delivered back
     *
     * @method setPlanStatus
     * @param {String} ideaId
     * @param {String} status
     * @returns {void}
     * @public
     */
    setPlanStatus(ideaId, status) {
        // a plan query still in flight must not overwrite this status, nor does this status mean the others are loaded
        this.liveStatuses = { ...this.liveStatuses, [ideaId]: status };
        this.planStatuses = { ...this.planStatuses, [ideaId]: status };
    }

    /**
     * Loads the plans of the ideas and keeps the status of the plan with the highest version of each
     *
     * @method loadPlanStatuses
     * @param {Array} ideas
     * @param {Function} [loadPlans] Loads the plans of idea ids, loadPlans by default
     * @returns {Promise}
     * @public
     */
    async loadPlanStatuses(ideas, loadPlans = ids => this.loadPlans(ids)) {
        let sequence = ++this.planSequence;
        this.liveStatuses = {};
        let plans;
        try {
            plans = await loadPlans(ideas.map(idea => idea.id));
        } catch {
            plans = null;
        }
        if (this.isDestroying || this.isDestroyed || sequence !== this.planSequence) {
            return;
        }
        // keep the ids marked loaded meanwhile, such as an idea created while this query was pending
        let loadedIds = new Set([...this.loadedIdeaIds, ...ideas.map(idea => idea.id)]);
        if (!plans) {
            this.loadedIdeaIds = loadedIds;
            return;
        }
        let latest = {};
        for (let plan of plans.toArray?.() ?? plans) {
            let known = latest[plan.ideaId];
            if (!known || Number(plan.version) > Number(known.version)) {
                latest[plan.ideaId] = plan;
            }
        }
        this.planStatuses = {
            ...Object.fromEntries(Object.entries(latest).map(([id, plan]) => [id, plan.status])),
            ...this.liveStatuses
        };
        this.loadedIdeaIds = loadedIds;
    }

    /**
     * Whether the footer offers the archived ideas: there are some, also during a search
     *
     * @property hasArchivedToggle
     * @type Boolean
     * @public
     */
    get hasArchivedToggle() {
        return this.archivedTotal > 0;
    }

    /**
     * Collapses or expands the idea browser and remembers the choice
     *
     * @method toggleBrowser
     * @public
     */
    @action
    toggleBrowser() {
        this.browserCollapsed = !this.browserCollapsed;
        try {
            localStorage.setItem(STORAGE_KEY, this.browserCollapsed);
        } catch (e) {
            // Storage is unavailable; the choice only lasts for this page.
        }
    }
}
