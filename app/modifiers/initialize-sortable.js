/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import Sortable from 'sortablejs';
import { action } from '@ember/object';
import { service } from '@ember/service';

/**
 * Pixels the pointer must travel after mousedown before SortableJS starts a fallback drag.
 * The board uses forceFallback, and with the default of 0 a 1px move while clicking a card
 * title starts a drag; SortableJS then swallows the following click, so the quick view
 * never opens.
 *
 * @property FALLBACK_TOLERANCE
 * @type {Number}
 * @final
 */
const FALLBACK_TOLERANCE = 5;

/**
 * Milliseconds a touch must be held before a drag starts (touch only), so taps and scrolls
 * are not mistaken for drags.
 *
 * @property TOUCH_DRAG_DELAY
 * @type {Number}
 * @final
 */
const TOUCH_DRAG_DELAY = 150;

/**
 * How long, in milliseconds, a collapsed lane keeps its outline after a card is dropped on it.
 */
const LANE_DROPPED_FLASH = 800;

/**
 * Media query for phones (below Bootstrap's 768px breakpoint); card dragging is off there.
 *
 * @property PHONE_MEDIA_QUERY
 * @type {String}
 * @final
 */
const PHONE_MEDIA_QUERY = '(max-width: 767.98px)';

/**
 * This modifier is called on the initialization of taskboard component and SortableJS
 * is attached to every items inside that taskboard in order to make it draggable.
 *
 * @example
 *      <div id="taskboard-container" {{initialize-sortable group="milestone" ...}}>
 * 
 * @class InitializeSortable
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeSortable extends Modifier {

    /**
     * The element the modifier is installed on
     *
     * @property element
     * @type HTMLElement
     * @private
     */
    element = null;

    /**
     * The named arguments of the latest run
     *
     * @property named
     * @type Object
     * @private
     */
    named = {};

    /**
     * Removes Sortable from the task board when the modifier is torn down.
     *
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     */
    constructor(owner, args) {
        super(owner, args);
        this._onViewportChange = () => this._applyDisabled();
        this._watchViewport();
        registerDestructor(this, () => {
            if (this.phoneQuery) {
                this.phoneQuery.removeEventListener('change', this._onViewportChange);
            }
            this._teardown();
        });
    }

    /**
     * Installs Sortable on the first run and refreshes it when the arguments change.
     *
     * @method modify
     * @param {HTMLElement} element
     * @param {Array} positional
     * @param {Object} named
     * @public
     */
    modify(element, positional, named) {
        this.named = named;
        if (this.element) {
            this._update();
            return;
        }
        this.element = element;
        this._install();
    }

    /**
     * This function returns group name. This property is attached with every lane of taskboard.
     * An item can be switched from one lane to other if the other lane, on which we are dropping
     * our item, has same group as the dragged item's lane have.
     *
     * @method get
     * @return String
     * @public
     */
    get groupName() {
        return this.named.group;
    }

    /**
     * This function returns scroll value. If set to true then AutoScroll plugin on 
     * sortable will be enabled and if set to false then browser's default scrolling 
     * functionality will be disabled.
     *
     * @method get
     * @return boolean
     * @public
     */
    get scroll() {
        return this.named.scroll;
    }

    /**
     * This function returns scroll sensitivty in px. The value shows how 
     * near the mouse will be to an edge to start scrolling. This will work
     * if forceFallBack value is set to true.
     *
     * @method get
     * @return integer
     * @public
     */
    get scrollSensitivity() {
        return this.named.scrollSensitivity;   
    }

    /**
     * This function returns scrolling speed in px. This will work if forceFallBack value
     * is set to true.
     *
     * @method get
     * @return integer
     * @public
     */
    get scrollSpeed() {
        return this.named.scrollSpeed;
    }

    /**
     * This function returns sort value. If set to true then sorting of items between lanes
     * will be enabled.
     *
     * @method get
     * @return boolean
     * @public
     */
    get sort() {
        return this.named.sort;
    }

    /**
     * This function returns forceFallback value. If set to true then browser's default scrolling
     * on item selection will be disabled.
     *
     * @method get
     * @return boolean
     * @public
     */
    get forceFallback() {
        return this.named.forceFallback;
    }

    /**
     * This function returns a value on whether to disable sortable or not.
     *
     * @method get
     * @return boolean
     * @public
     */
    get disableSortable() {
        return this.isPhone || !!this.named.disableSortable;
    }

    /**
     * Whether the viewport is below the phone breakpoint, where dragging cards fights with
     * scrolling the lanes (the Move icon on the card covers moving issues there).
     *
     * @method get
     * @return boolean
     * @public
     */
    get isPhone() {
        return !!(this.phoneQuery && this.phoneQuery.matches);
    }

    /**
     * Starts watching the phone breakpoint and keeps the Sortable instances in step with it.
     *
     * @method _watchViewport
     * @private
     */
    _watchViewport() {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }
        this.phoneQuery = window.matchMedia(PHONE_MEDIA_QUERY);
        this.phoneQuery.addEventListener('change', this._onViewportChange);
    }

    /**
     * Turns dragging on or off on every lane and milestone tab when the viewport crosses the breakpoint.
     *
     * @method _applyDisabled
     * @private
     */
    _applyDisabled() {
        let disabled = this.disableSortable;
        let targets = document.querySelectorAll('.lane.box-body, [data-milestone-tab]');
        targets.forEach((el) => {
            let instance = Sortable.get(el);
            if (instance) {
                instance.option('disabled', disabled);
            }
        });
    }

    /**
     * This function returns animation speed. This speed appears when items will be 
     * shifted from one lane to another. 
     *
     * @method get
     * @return integer
     * @public
     */
    get animationSpeed() {
        return this.named.animationSpeed;
    }

    /**
     * This function returns drag class. It is used to apply class on dragged item.
     * 
     * @method get
     * @return String
     * @public
     */
    get dragClass() {
        return this.named.dragClass;
    }

    /**
     * This function returns chosen class. It is used to apply class on chosen item.
     *
     * @method get
     * @return String
     * @public
     */
    get chosenClass() {
        return this.named.chosenClass;
    }

    /**
     * This function returns ""updateIssue" method which is used to update the issue when user drop
     * an "issue item" to some other lane of task board.
     *
     * @method get
     * @return String
     * @public
     */
    get updateIssue() {
        return this.named.updateIssue;
    }

    /**
     * This function returns array of milestones which is displayed in the task board.
     *
     * @method get
     * @return String
     * @public
     */
    get milestones() {
        return this.named.milestones;
    }

    /**
     * This function returns the milestone container element on which user is currently 
     * filtering the issues.
     *
     * @method get
     * @return String
     * @public
     */
    get query() {
        return this.named.query;
    }

    /**
     * This property is used to keep in track the old highlighted lane.
     *
     * @property oldLane
     * @type Object
     * @private
     */
    oldLane = null;

    /**
     * The number of milestones of the latest run.
     *
     * @property milestoneCount
     * @type Number
     * @private
     */
    milestoneCount = 0;

    /**
     * This property is used to keep in track the item dragged by user.
     *
     * @property draggedItem
     * @type Object
     * @private
     */
    draggedItem = null;

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for InitializeSortable
     * @private
     */
    @service trackedProject;


    /**
     * This property is used to keep in track the project id.
     *
     * @property projectId
     * @type String
     * @private
     */
    projectId = this.trackedProject.getProjectId();

    /**
     * Attaches Sortable to the lanes and the milestone tabs.
     *
     * @method _install
     * @private
     */
    _install() {
        this._attachSortableToLanes();
        this._setupMilestoneTabsAsSortable();
        this._setupTabSwitching();
        this._setupCollapsedLaneSortables();
        this._observeLaneCollapse();
    }

    /**
     * This function attaches sortable to the lanes.
     * 
     * @method _attachSortableToLanes
     * @private
     */
    _attachSortableToLanes() {
        let _self = this;
        let elementsList = _self.element.querySelectorAll('.lane.box-body');
        elementsList.forEach((el) => {
            if (!Sortable.get(el)) {
                new Sortable(el, _self.getSortableOptions());
            }
        });

        _self._setupMilestoneTabsAsSortable();
        _self._setupTabSwitching();
        _self._setupCollapsedLaneSortables();
    }

    /**
     * This function gets milestone elements with a ctive milestone prioritized first.
     * 
     * @method _getOrderedMilestoneElements
     * @returns {Array} Array of milestone elements with active one first
     * @private
     */
    _getOrderedMilestoneElements() {
        // Get active milestone tab's lane box body element first
        let activeTab = document.querySelector('[data-milestone-tab].active');
        let activeMilestoneEl = null;
        if (activeTab) {
            let milestoneId = activeTab.getAttribute('data-milestone-id') || 'backlog';
            activeMilestoneEl = document.querySelector(`[data-field-milestone-id="${milestoneId}"]`);
        }
        
        // Get all milestone lane box body elements
        let allMilestoneEls = document.querySelectorAll('div.milestone.box-body');
        
        // Create ordered array with active milestone first, then inactive ones
        let milestoneEls = [];
        if (activeMilestoneEl) {
            milestoneEls.push(activeMilestoneEl);
        }
        
        // Add inactive milestone elements
        allMilestoneEls.forEach((el) => {
            if (el !== activeMilestoneEl) {
                milestoneEls.push(el);
            }
        });
        
        return milestoneEls;
    }

    /**
     * Re-attaches Sortable to lanes re-rendered after the arguments changed.
     *
     * @method _update
     * @private
     */
    _update() {
        // Only update the sortable to lanes if the project id has changed
        let lastProjectId = this.trackedProject.getProjectId();
        if(this.projectId !== lastProjectId) {
            this._attachSortableToLanes();
            this.projectId = lastProjectId;
        }

        // Lanes re-rendered by a new milestone or a search reload (paramsQuery) need Sortable again;
        // lanes that already have it are skipped by _attachSortableToLanes.
        // Reading the milestones length makes the modifier re-run for every added or removed milestone,
        // not only the first one (newMilestoneAdded stays true after it flips once).
        let milestoneCount = this.named.milestones ? this.named.milestones.length : 0;
        if(milestoneCount !== this.milestoneCount || this.named.newMilestoneAdded || this.named.paramsQuery !== undefined) {
            this.milestoneCount = milestoneCount;
            this._attachSortableToLanes();
        }
        this._cleanupMilestoneTabSortables();
        this._setupMilestoneTabsAsSortable();
        this._setupTabSwitching();
        this._setupCollapsedLaneSortables();
    }

    /**
     * This function apply slim scroll to element.
     * 
     * @method _applySlimScroll
     * @param {HTMLElement} el
     * @private
     */
    _applySlimScroll(el) {
        let p = el.querySelector('p.description');
        $(p).slimScroll({
            height: p.getBoundingClientRect().height,
            size: 3,
        });
    }

    /**
     * This function is bind with onStart function of the sortablejs. This function
     * will be triggered when user will start the dragging of an item from taskboard.
     * 
     * @method _onStart
     * @param {Object} evt
     * @private
     */
    _onStart(evt) {
        let _self = this;
        _self.selectDropzones(evt);
        _self.draggedItem = null;
    }

    /**
     * This function is bind with onEnd function of the sortablejs. This function
     * will be triggered when dragging of an item is stopped by user.
     * 
     * @method _onEnd
     * @param {Object} evt
     * @private
     */
    _onEnd(evt) {
        let _self = this;
        
        if (evt.to !== evt.from) {
            if (evt.to.classList.contains('lane-collapsed')) {
                _self._handleCollapsedLaneDrop(evt);
            } else if (evt.to.parentElement.hasAttribute('data-milestone-tab')) {
                evt.to = evt.to.parentElement;
                if (!evt.to.classList.contains('active')) {
                    let prevMilestoneId = evt.from.getAttribute('data-field-milestone-id');
                    let newMilestoneId = evt.to.getAttribute('data-milestone-id');
                    if (prevMilestoneId !== newMilestoneId) {
                        _self._handleMilestoneTabDrop(evt);
                    }
                }
            } else {
                _self.updateIssue(evt.item, evt.to, evt.from);
            }
        }
        
        _self.unSelectDropzones(evt);
        _self.oldLane = null;
    }

    /**
     * This function highlight dropzones related to current selected item. It is called on 'onStart'
     * function of the sortablejs and that function is called when user just starts the dragging
     * of an item from a lane and the remaining lanes on the taskboard having same group name, 
     * which the dragged item's lane have, will be highlighted.
     * 
     * @method selectDropzones
     * @param {Object} evt 
     */
    selectDropzones(evt) {
        let _self = this;
        evt.from.classList.add('curr-lane');
        let droppableSections = document.querySelectorAll(`div.lane.box-body`);
        droppableSections.forEach((node) => {
            (node.getAttribute('data-field-lane-group') === _self.groupName) && node.classList.add('box-body-border');
        });
        
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab]');
        milestoneTabs.forEach((tab) => {
            if (!tab.classList.contains('active')) {
                tab.classList.add('milestone-tab-droppable');
            }
        });

        document.querySelectorAll('.lane.lane-collapsed').forEach((lane) => {
            lane.classList.add('lane-droppable');
        });
    }

    /**
     * This function removes highlighted dropzones related to current selected item. It is called on 'onEnd'
     * function of the sortablejs and that function is called when user just stops the dragging of an
     * item.
     * 
     * @method unSelectDropzones
     * @param {Object} evt 
     */
    unSelectDropzones(evt) {
        evt.from.classList.remove('curr-lane');
        let droppableSections = document.querySelectorAll(`div.lane.box-body`);
        droppableSections.forEach((node) => {
            node.classList.remove('box-body-border');
            node.classList.remove('box-body-color');
        });
        
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab]');
        milestoneTabs.forEach((tab) => {
            tab.classList.remove('milestone-tab-droppable');
            tab.classList.remove('milestone-tab-hover');
        });

        document.querySelectorAll('.lane.lane-collapsed').forEach((lane) => {
            lane.classList.remove('lane-droppable', 'lane-hover');
        });
    }

    /**
     * This function handles the drop of an issue card on a collapsed lane. The lane's hidden card area
     * carries the status and milestone data, so it is handed to updateIssue as the target. The lane stays
     * collapsed and flashes briefly to confirm the drop.
     *
     * @method _handleCollapsedLaneDrop
     * @param {Object} evt
     * @private
     */
    _handleCollapsedLaneDrop(evt) {
        let _self = this;
        let lane = evt.to;
        let laneBody = lane.querySelector(':scope > .lane.box-body');
        if (!laneBody) {
            return;
        }
        _self.updateIssue(evt.item, laneBody, evt.from);
        lane.classList.add('lane-dropped');
        clearTimeout(_self.laneFlashTimer);
        _self.laneFlashTimer = setTimeout(() => lane.classList.remove('lane-dropped'), LANE_DROPPED_FLASH);
    }

    /**
     * This function destroys the sortable instances of the collapsed lanes.
     *
     * @method _cleanupCollapsedLaneSortables
     * @private
     */
    _cleanupCollapsedLaneSortables() {
        document.querySelectorAll('.lane[data-lane-name]').forEach((lane) => {
            if (lane.collapsedSortable) {
                lane.collapsedSortable.destroy();
                lane.collapsedSortable = null;
            }
        });
    }

    /**
     * This function makes every collapsed lane a drop target (no sorting), like the milestone tabs, and
     * removes the target from lanes that are open again.
     *
     * @method _setupCollapsedLaneSortables
     * @private
     */
    _setupCollapsedLaneSortables() {
        let _self = this;
        document.querySelectorAll('.lane[data-lane-name]').forEach((lane) => {
            let collapsed = lane.classList.contains('lane-collapsed');
            if (lane.collapsedSortable && !collapsed) {
                lane.collapsedSortable.destroy();
                lane.collapsedSortable = null;
            } else if (!lane.collapsedSortable && collapsed) {
                lane.collapsedSortable = new Sortable(lane, {
                    group: _self.groupName,
                    sort: false,
                    forceFallback: _self.forceFallback,
                    disabled: !!_self.disableSortable,
                    animation: _self.animationSpeed,
                    draggable: '.not-draggable',
                    filter: '*'
                });
            }
        });
    }

    /**
     * This function re-creates the collapsed lane targets when a lane is collapsed or expanded.
     *
     * @method _observeLaneCollapse
     * @private
     */
    _observeLaneCollapse() {
        let _self = this;
        if (_self.laneObserver || typeof MutationObserver === 'undefined') {
            return;
        }
        _self.laneObserver = new MutationObserver(() => _self._setupCollapsedLaneSortables());
        _self.laneObserver.observe(_self.element, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
            childList: true
        });
    }

    /**
     * This function applies slim scroll to the items in the milestone container.
     * 
     * @method applySlimScrollToMilestoneItems
     * @param {HTMLElement} milestoneEl
     * @private
     */
    applySlimScrollToMilestoneItems(milestoneEl) {
        let _self = this;
        let lanes = [...milestoneEl.children];
        lanes.forEach((lane) => {
            let laneBody = lane.querySelector('div.lane.box-body');
            let laneItems = [...laneBody.children];
            laneItems.forEach((item) => {
                _self._applySlimScroll(item);
            });            
        });
    }

    /**
     * This function handles the drop of an issue card on a milestone tab.
     * 
     * @method _handleMilestoneTabDrop
     * @param {Object} evt
     * @private
     */
    _handleMilestoneTabDrop(evt) {
        let _self = this;
        let milestoneId = evt.to.getAttribute('data-milestone-id');
        
        let targetMilestone = document.querySelector(`#tab_${milestoneId}`);
        let laneStatus = evt.from.getAttribute('data-field-status');
        let newMilestoneLane = null;
        if (targetMilestone) {
            let lanes = targetMilestone.querySelectorAll('.lane.box-body');
            lanes.forEach((lane) => {
                if (lane.getAttribute('data-field-status') === laneStatus && !newMilestoneLane) {
                    newMilestoneLane = lane;
                }
            });
        }
        _self.updateIssue(evt.item, newMilestoneLane, evt.from);
    }

    /**
     * This function cleans up all existing milestone tab sortable instances.
     * 
     * @method _cleanupMilestoneTabSortables
     * @private
     */
    _cleanupMilestoneTabSortables() {
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab] .drop-zone-area');
        
        milestoneTabs.forEach((dropZoneArea) => {
            if (dropZoneArea.sortable) {
                dropZoneArea.sortable.destroy();
                dropZoneArea.sortable = null;
            }
        });
    }

    /**
     * This function sets up milestone tabs as SortableJS instances so they can accept
     * dropped issue cards from other lanes.
     * 
     * @method _setupMilestoneTabsAsSortable
     * @private
     */
    _setupMilestoneTabsAsSortable() {
        let _self = this;
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab]');
        
        milestoneTabs.forEach((tab) => {
            let dropZoneArea = tab.querySelector('.drop-zone-area');
            if (dropZoneArea.sortable) {
                dropZoneArea.sortable.destroy();
                dropZoneArea.sortable = null;
            }
            
            if (!tab.classList.contains('active')) {
                dropZoneArea.sortable = new Sortable(tab, {
                    group: _self.groupName,
                    scroll: _self.scroll,
                    scrollSensitivity: _self.scrollSensitivity,
                    scrollSpeed: _self.scrollSpeed,
                    sort: false, // Don't allow sorting within tabs
                    forceFallback: _self.forceFallback,
                    disabled: !!_self.disableSortable,
                    fallbackTolerance: FALLBACK_TOLERANCE,
                    delay: TOUCH_DRAG_DELAY,
                    delayOnTouchOnly: true,
                    touchStartThreshold: FALLBACK_TOLERANCE,
                    animation: _self.animationSpeed,
                    dragClass: _self.dragClass,
                    chosenClass: _self.chosenClass,
                    filter: '.not-draggable'
                });
            }
        });
    }

    /**
     * This function sets up event listeners for tab switching to update sortable instances
     * when the active tab changes.
     * 
     * @method _setupTabSwitching
     * @private
     */
    _setupTabSwitching() {
        let _self = this;
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab]');
        
        milestoneTabs.forEach((tab) => {
            let tabLink = tab.querySelector('a');
            if (tabLink) {
                tabLink.addEventListener('click', () => {
                    // Small delay to allow tab switching to complete
                    setTimeout(() => {
                        _self._updateSortableInstances();
                    }, 100);
                });
            }
        });
    }

    /**
     * This function updates sortable instances when tab switching occurs.
     * It removes sortable from the newly active tab and adds it to the previously active tab.
     * 
     * @method _updateSortableInstances
     * @private
     */
    _updateSortableInstances() {
        let _self = this;
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab]');
        
        milestoneTabs.forEach((tab) => {
            let isActive = tab.classList.contains('active');
            let dropZoneArea = tab.querySelector('.drop-zone-area');
            let hasSortable = dropZoneArea.sortable;
            
            if (hasSortable) {
                dropZoneArea.sortable.destroy();
                dropZoneArea.sortable = null;
            }
            if (!isActive) {
                tab = dropZoneArea;
                dropZoneArea.sortable = new Sortable(tab, {
                    group: _self.groupName,
                    scroll: _self.scroll,
                    scrollSensitivity: _self.scrollSensitivity,
                    scrollSpeed: _self.scrollSpeed,
                    sort: false,
                    forceFallback: _self.forceFallback,
                    disabled: !!_self.disableSortable,
                    fallbackTolerance: FALLBACK_TOLERANCE,
                    delay: TOUCH_DRAG_DELAY,
                    delayOnTouchOnly: true,
                    touchStartThreshold: FALLBACK_TOLERANCE,
                    animation: _self.animationSpeed,
                    dragClass: _self.dragClass,
                    chosenClass: _self.chosenClass,
                    filter: '.not-draggable'
                });
            }
        });
    }

    /**
     * This function returns the sortable options.
     * 
     * @method getSortableOptions
     * @returns {Object} The sortable options
     * @private
     */
    getSortableOptions() {
        let _self = this;
        return {
            group: _self.groupName,
            scroll: _self.scroll,
            scrollSensitivity: _self.scrollSensitivity,
            scrollSpeed: _self.scrollSpeed,
            sort: _self.sort,
            forceFallback: _self.forceFallback,
            disabled: !!_self.disableSortable,
            fallbackTolerance: FALLBACK_TOLERANCE,
            delay: TOUCH_DRAG_DELAY,
            delayOnTouchOnly: true,
            touchStartThreshold: FALLBACK_TOLERANCE,
            animation: _self.animationSpeed,
            filter: '[data-issue-assignee-dropdown], [data-issue-move], [data-lane-add]',
            preventOnFilter: false,
            dragClass: _self.dragClass,
            chosenClass: _self.chosenClass,
            onStart: (evt) => {
                _self._onStart(evt);
            },
            onEnd: (evt) => {
                _self._onEnd(evt);
            },
            onMove: (evt) => {
                let hoverClass = evt.to.classList.contains('lane-collapsed') ? 'lane-hover' : 'box-body-color';
                evt.to.classList.add(hoverClass);
                (_self.oldLane) && _self.oldLane.classList.remove('box-body-color', 'lane-hover');
                _self.oldLane = evt.to;
                _self.draggedItem = (evt.to != evt.from) ? evt.dragged : null;
            },
            store: {
                set: () => {
                    (_self.draggedItem) && (_self.draggedItem.remove());
                }
            }
        }
    }

    /**
     * Removes Sortable from each item of the task board.
     *
     * @method _teardown
     * @private
     */
    _teardown() {
        let _self = this;
        if (!_self.element) {
            return;
        }
        let elementsList = _self.element.querySelectorAll('.lane.box-body');
        elementsList.forEach((el) => {
            if (Sortable.get(el)) {
                Sortable.get(el).destroy();
            }
        });
        _self._cleanupMilestoneTabSortables();
        _self._cleanupCollapsedLaneSortables();
        if (_self.laneObserver) {
            _self.laneObserver.disconnect();
            _self.laneObserver = null;
        }
    }
}
