/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { DEFAULT_PAGE, DEFAULT_SORT, DEFAULT_ORDER, DEFAULT_GROUP } from 'prometheus/utils/idea/browser-defaults';
import { planStatusClass } from 'prometheus/utils/idea/plan-status';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';

const SAVED_SEARCH_MESSAGES = 'views.app.issue.list.savedsearch';
const STORAGE_KEY = 'ideaBrowserCollapsed';
const OPEN = 'open';
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
        return [
            { key: 'Idea.dateModified', label: this.intl.t('views.app.idea.browser.sort.dateModified') },
            { key: 'Idea.dateCreated', label: this.intl.t('views.app.idea.browser.sort.dateCreated') },
            { key: 'Idea.title', label: this.intl.t('views.app.idea.browser.sort.title') }
        ];
    }

    /**
     * The group options of the list menu
     *
     * @property groupOptions
     * @type Array
     * @public
     */
    get groupOptions() {
        let progress = this.progressByIdea;
        let creators = new Map(this.ideas.map(idea => [String(idea.createdUser), idea.belongsTo('createdBy').value()?.name]));
        return [
            { key: 'none', label: this.intl.t('views.app.idea.browser.group.none') },
            {
                key: 'planStatus',
                label: this.intl.t('views.app.idea.browser.group.planStatus'),
                groupKey: idea => progress[idea.id]?.label ?? null,
                groupLabel: key => this.intl.t(key)
            },
            {
                key: 'createdBy',
                label: this.intl.t('views.app.idea.browser.group.createdBy'),
                groupKey: idea => idea.createdUser,
                groupLabel: key => creators.get(String(key)) || this.intl.t('views.app.idea.browser.unknownUser')
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
        this.sort = key;
        this.order = next.toUpperCase();
        this.page = 1;
    }

    /**
     * Groups the list; grouping by creator changes the server sort, so it starts from the first page
     *
     * @method groupList
     * @param {String} key none, planStatus or createdBy
     * @returns {void}
     * @public
     */
    @action
    groupList(key) {
        this.group = key;
        this.page = 1;
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
        this.page = page;
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
     * The Gaia query the list is narrowed by, null for none
     *
     * @property query
     * @type String
     * @public
     */
    @tracked query = null;

    /**
     * The id of the saved search the query came from, null for none
     *
     * @property searchId
     * @type String
     * @public
     */
    @tracked searchId = null;

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
     * The number of ideas the list query matches over all its pages, null while unknown
     *
     * @property totalIdeas
     * @type Number
     * @public
     */
    @tracked totalIdeas = null;

    /**
     * The number of archived ideas of the project, for the footer toggle; null while unknown or searching
     *
     * @property archivedTotal
     * @type Number
     * @public
     */
    @tracked archivedTotal = null;

    /**
     * The number of ideas of the project whatever the search, counted while a search runs; null while unknown
     *
     * @property searchedProjectTotal
     * @type Number
     * @private
     */
    @tracked searchedProjectTotal = null;

    /**
     * The number of ideas of the project whatever the search and the archived toggle, null while unknown
     *
     * @property projectTotal
     * @type Number
     * @public
     */
    get projectTotal() {
        if (this.isSearching) {
            return this.searchedProjectTotal;
        }
        if (this.totalIdeas === null) {
            return null;
        }
        return this.showArchived ? this.totalIdeas : this.totalIdeas + (this.archivedTotal ?? 0);
    }

    /**
     * The options of the list query: search, page, sort, order, page size and archived toggle
     *
     * @property listOptions
     * @type Object
     * @public
     */
    get listOptions() {
        return {
            query: this.query,
            page: this.page,
            sort: this.sort,
            order: this.order,
            group: this.group,
            limit: this.pageSize,
            showArchived: this.showArchived
        };
    }

    /**
     * Shows a loaded page of ideas and the counts that came with it
     *
     * @method showIdeas
     * @param {Object} [ideas] The ideas the list query returned, their meta holds the total when Gaia sends it
     * @param {Object} [counts] The archived and project counts of the route
     * @returns {void}
     * @public
     */
    showIdeas(ideas, counts) {
        this.ideas = ideas ? ideas.toArray() : [];
        let total = ideas?.meta?.total;
        if (total === undefined || total === null) {
            // Gaia does not send meta.total yet: the count is only known when every idea is loaded.
            total = ideas && this.pageSize === -1 ? this.ideas.length : null;
        }
        this.totalIdeas = total === null ? null : Number(total);
        this.archivedTotal = counts?.archived ?? null;
        this.searchedProjectTotal = counts?.project ?? null;
    }

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
     * Runs a query from ezSearch; the route reloads the ideas for it
     *
     * @method applyQuery
     * @param {String} query The Gaia query, empty for none
     * @public
     */
    @action
    applyQuery(query) {
        this.query = query || null;
    }

    /**
     * Marks a saved search as the active one, or clears the mark
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
     * The ideas of the selected project, loaded by the route
     *
     * @property ideas
     * @type Array
     * @public
     */
    @tracked ideas = [];

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
     * @param {Function} loadPlans Loads the plans of idea ids, supplied by the route
     * @returns {Promise}
     * @public
     */
    async loadPlanStatuses(ideas, loadPlans) {
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
     * The open ideas of the page, in the order of the server sort
     *
     * @property openIdeas
     * @type Array
     * @public
     */
    get openIdeas() {
        return this.ideas.filter(idea => idea.status === OPEN);
    }

    /**
     * The archived ideas of the page, in the order of the server sort
     *
     * @property archivedIdeas
     * @type Array
     * @public
     */
    get archivedIdeas() {
        return this.ideas.filter(idea => idea.status === ARCHIVED);
    }

    /**
     * Whether the footer offers the archived ideas: there are some and no search runs
     *
     * @property hasArchivedToggle
     * @type Boolean
     * @public
     */
    get hasArchivedToggle() {
        return !this.isSearching && this.archivedTotal > 0;
    }

    /**
     * The ideas that are listed in the browser
     *
     * @property listedIdeas
     * @type Array
     * @public
     */
    get listedIdeas() {
        return this.showArchived || this.isSearching ? [...this.openIdeas, ...this.archivedIdeas] : this.openIdeas;
    }

    /**
     * Sequence of the latest reload; leaving the route or registering for another project also bumps it,
     * so a slower reload of an earlier project or request cannot overwrite the list
     *
     * @property reloadSequence
     * @type Number
     * @private
     */
    reloadSequence = 0;

    /**
     * Registers the events that change the idea list
     *
     * @method registerHermesIntents
     * @param {String} projectId
     * @param {Function} loadIdeas Runs the list query for listOptions, supplied by the route
     * @param {Function} loadPlans Loads the plans of idea ids, supplied by the route
     * @param {Function} [loadTotal] Loads the archived and project counts for listOptions, supplied by the route
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId, loadIdeas, loadPlans, loadTotal) {
        this.unregisterHermesIntents();
        this.reloadSequence++;
        if (!projectId) {
            return;
        }
        this.loaders = { loadIdeas, loadPlans, loadTotal };
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'idea.created': envelope => this.handleIdeaCreated(envelope, loadIdeas, loadPlans, loadTotal),
            'idea.updated': () => this.reloadIdeas(loadIdeas, loadPlans, loadTotal),
            'idea.plan.created': () => this.loadPlanStatuses(this.ideas, loadPlans),
            'idea.plan.status.changed': () => this.loadPlanStatuses(this.ideas, loadPlans)
        });
    }

    /**
     * Reloads the ideas when an idea is created, unless it is listed already. An idea created here is added
     * by the create page once it is saved, so its event finds it listed; the same user creating one in
     * another tab is not listed, so that event reloads.
     *
     * @method handleIdeaCreated
     * @param {Object} envelope Domain-event envelope
     * @param {Function} loadIdeas
     * @param {Function} loadPlans
     * @param {Function} [loadTotal]
     * @returns {Promise|void}
     * @public
     */
    handleIdeaCreated(envelope, loadIdeas, loadPlans, loadTotal) {
        let resourceId = envelope?.resource?.id;
        if (resourceId && this.ideas.some(listed => String(listed.id) === String(resourceId))) {
            return;
        }
        return this.reloadIdeas(loadIdeas, loadPlans, loadTotal);
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
            this.ideas = [idea, ...this.ideas];
            if (this.totalIdeas !== null) {
                this.totalIdeas++;
            }
            if (this.searchedProjectTotal !== null) {
                this.searchedProjectTotal++;
            }
            this.loadedIdeaIds = new Set([...this.loadedIdeaIds, idea.id]);
        }
    }

    /**
     * Disposes the Hermes registration
     *
     * @method unregisterHermesIntents
     * @returns {void}
     * @public
     */
    unregisterHermesIntents() {
        this.reloadSequence++;
        this.hermesDisposer?.();
        this.hermesDisposer = null;
        this.loaders = null;
    }

    /**
     * Re-runs the current list query and counts
     *
     * @method reloadIdeas
     * @param {Function} loadIdeas
     * @param {Function} loadPlans
     * @param {Function} [loadTotal]
     * @returns {Promise}
     * @public
     */
    async reloadIdeas(loadIdeas, loadPlans, loadTotal) {
        let sequence = ++this.reloadSequence;
        let options = this.listOptions;
        let [ideas, counts] = await Promise.all([loadIdeas(options), loadTotal ? loadTotal(options) : null]);
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        if (ideas && sequence === this.reloadSequence) {
            this.showIdeas(ideas, counts);
            if (loadPlans) {
                await this.loadPlanStatuses(this.ideas, loadPlans);
            }
        }
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
        // the archived and page query params refresh the route, which reads them
        this.archived = !this.archived;
        this.page = 1;
    }

    /**
     * Re-runs the current list query and counts with the loaders of the route, after a change that moves ideas
     * between the listed and unlisted statuses
     *
     * @method refreshList
     * @returns {Promise}
     * @public
     */
    async refreshList() {
        if (this.loaders) {
            let { loadIdeas, loadPlans, loadTotal } = this.loaders;
            await this.reloadIdeas(loadIdeas, loadPlans, loadTotal);
        }
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
