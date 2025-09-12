/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import Sortable from 'sortablejs';
import { action } from '@ember/object';

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
     * This function returns group name. This property is attached with every lane of taskboard.
     * An item can be switched from one lane to other if the other lane, on which we are dropping
     * our item, has same group as the dragged item's lane have.
     *
     * @method get
     * @return String
     * @public
     */
    get groupName() {
        return this.args.named.group;
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
        return this.args.named.scroll;
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
        return this.args.named.scrollSensitivity;
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
        return this.args.named.scrollSpeed;
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
        return this.args.named.sort;
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
        return this.args.named.forceFallback;
    }

    /**
     * This function returns a value on whether to disable sortable or not.
     *
     * @method get
     * @return boolean
     * @public
     */
    get disableSortable() {
        return this.args.named
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
        return this.args.named.animationSpeed;
    }

    /**
     * This function returns drag class. It is used to apply class on dragged item.
     * 
     * @method get
     * @return String
     * @public
     */
    get dragClass() {
        return this.args.named.dragClass;
    }

    /**
     * This function returns chosen class. It is used to apply class on chosen item.
     *
     * @method get
     * @return String
     * @public
     */
    get chosenClass() {
        return this.args.named.chosenClass;
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
        return this.args.named.updateIssue;
    }

    /**
     * This function returns array of milestones which is displayed in the task board.
     *
     * @method get
     * @return String
     * @public
     */
    get milestones() {
        return this.args.named.milestones;
    }

    /**
     * This function returns the milestone container element on which user is currently 
     * filtering the issues.
     *
     * @method get
     * @return String
     * @public
     */
    get currentFilteredMilestone() {
        return this.args.named.currentFilteredMilestone;
    }
    /**
     * This property contains array of sortable objects. This is used to store sortable
     * objects that are attached to each lane. This property is used when this page will 
     * destroy in order to remove sortable from each lane.
     *
     * @property sortableList
     * @type Array
     * @private
     */
    sortableList = [];

    /**
     * This property is used to keep in track the old highlighted lane.
     *
     * @property oldLane
     * @type Object
     * @private
     */
    oldLane = null;

    /**
     * This property is used to keep in track the item dragged by user.
     *
     * @property draggedItem
     * @type Object
     * @private
     */
    draggedItem = null;

    //Called when the modifier is installed on the DOM element
    didInstall() {
        let _self = this;
        let elementsList = _self.element.querySelectorAll('.lane.box-body');
        elementsList.forEach((el) => {
            _self.sortableList.push(new Sortable(el, {
                group: _self.groupName,
                scroll: _self.scroll,
                scrollSensitivity: _self.scrollSensitivity,
                scrollSpeed: _self.scrollSpeed,
                sort: _self.sort,
                forceFallback: _self.forceFallback,
                disableSortable: _self.disableSortable,
                animation: _self.animationSpeed,
                dragClass: _self.dragClass,
                chosenClass: _self.chosenClass,
                onStart: (evt) => {
                    _self._onStart(evt);
                },
                onEnd: (evt) => {
                    _self._onEnd(evt);
                },
                onMove: (evt) => {
                    evt.to.classList.add('box-body-color');
                    (_self.oldLane) && _self.oldLane.classList.remove('box-body-color');
                    _self.oldLane = evt.to;
                    _self.draggedItem = (evt.to != evt.from) ? evt.dragged : null;
                },
                store: {
                    set: () => {
                        (_self.draggedItem) && (_self.draggedItem.remove());
                    }
                },
            }));
        });

        _self._setupMilestoneTabsAsSortable();
        _self._setupTabSwitching();
        
        let milestoneEls = document.querySelectorAll('div.milestone.box-body');
        _self.reRenderView(milestoneEls);
    }

    //Called when the arguments provided to modifier are updated
    didUpdateArguments() {
        let _self = this;
        
        _self._cleanupMilestoneTabSortables();
        _self._setupMilestoneTabsAsSortable();
        _self._setupTabSwitching();
        
        let milestoneEls = [];
        milestoneEls.pushObject(_self.currentFilteredMilestone);
        _self.reRenderView(milestoneEls);
    }

    /**
     * This function is used to re-render the view by adjusting the heights of 
     * milestone container elements and applying slim scroll to issue items.
     * 
     * @method reRenderView
     * @param {HTMLCollection} milestoneEls List of milestone container elements
     * @private
     */
    @action reRenderView(milestoneEls) {
        let _self = this;
        let milestoneIds = [];
        milestoneEls.forEach((milestoneEl) => {
            let milestoneId = milestoneEl.dataset.fieldMilestoneId || 'backlog';
            milestoneIds.push(milestoneId);
            document.querySelector(`[data-milestone-id="${milestoneId}"] a`).click();
            _self.setMilestoneBoxHeight(milestoneEl);
        });
        
        document.querySelector(`[data-milestone-id="${milestoneIds[0]}"] a`).click();
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
            if (evt.to.hasAttribute('data-milestone-tab')) {
                if (!evt.to.classList.contains('active')) {
                    let prevMilestoneId = evt.from.getAttribute('data-field-milestone-id');
                    let newMilestoneId = evt.to.getAttribute('data-milestone-id');
                    if (prevMilestoneId !== newMilestoneId) {
                        _self._handleMilestoneTabDrop(evt);
                    }
                }
            } else {
                _self.updateIssue(evt.item, evt.to, evt.from, _self.reRenderView);
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
    }

    /**
     * This function is called when an item is shifted from one lane to another lane (its status is updated)
     * and is used to set the height of parent element by getting max size of a lane and that max is set it to its
     * parent element. Parent element is a section which contain lanes. Firstly this function will be called on the 
     * initialization of this modifier (on reRender function) to set the every sections of milestone.
     * 
     * @method setMilestoneBoxHeight
     * @param {HTMLElement} parentElement it contains milestone container element
     */
    setMilestoneBoxHeight(parentElement) {
        let parentHeaderHeight = parentElement.parentNode.querySelector('div.box-header').getBoundingClientRect().height;
        let lanes = [...parentElement.children];
        let heightArray = [];
        let _self = this;
        lanes.forEach((lane) => {
            let laneBody = lane.querySelector('div.lane.box-body');
            let items = [...laneBody.children];
            let sum = 0;
            items.forEach((item) => {
                let itemCSS = getComputedStyle(item);
                _self._applySlimScroll(item);
                sum += item.getBoundingClientRect().height + parseFloat(itemCSS.marginTop);
            })
            heightArray.push(sum);
        });
        let max = (Math.max(...heightArray) + (parentHeaderHeight * 2));
        let minHeight = 0;
        let minHeightApplied = false;

        //set height of lanes
        lanes.forEach((lane) => {
            let headerHeight = lane.querySelector('div.box-header').getBoundingClientRect().height;
            let laneBody = lane.querySelector('div.lane.box-body');
            minHeight = parseFloat(getComputedStyle(laneBody).minHeight);
            let height = max - (headerHeight + parentHeaderHeight);
            if (height < minHeight) {
                height = minHeight;
                minHeightApplied = true;
            }
            laneBody.style.height = `${height}px`;
        });
        (minHeightApplied) && (max = minHeight + 70);
        parentElement.style.height = `${max}px`;

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
        _self.updateIssue(evt.item, newMilestoneLane, evt.from, _self.reRenderView);
    }

    /**
     * This function cleans up all existing milestone tab sortable instances.
     * 
     * @method _cleanupMilestoneTabSortables
     * @private
     */
    _cleanupMilestoneTabSortables() {
        let milestoneTabs = document.querySelectorAll('[data-milestone-tab]');
        
        milestoneTabs.forEach((tab) => {
            if (tab.sortable) {
                tab.sortable.destroy();
                tab.sortable = null;
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
            if (tab.sortable) {
                tab.sortable.destroy();
                tab.sortable = null;
            }
            
            if (!tab.classList.contains('active')) {
                tab.sortable = new Sortable(tab, {
                    group: _self.groupName,
                    scroll: _self.scroll,
                    scrollSensitivity: _self.scrollSensitivity,
                    scrollSpeed: _self.scrollSpeed,
                    sort: false, // Don't allow sorting within tabs
                    forceFallback: _self.forceFallback,
                    disableSortable: _self.disableSortable,
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
            let hasSortable = tab.sortable;
            
            if (hasSortable) {
                tab.sortable.destroy();
                tab.sortable = null;
            }
            
            if (!isActive) {
                tab.sortable = new Sortable(tab, {
                    group: _self.groupName,
                    scroll: _self.scroll,
                    scrollSensitivity: _self.scrollSensitivity,
                    scrollSpeed: _self.scrollSpeed,
                    sort: false,
                    forceFallback: _self.forceFallback,
                    disableSortable: _self.disableSortable,
                    animation: _self.animationSpeed,
                    dragClass: _self.dragClass,
                    chosenClass: _self.chosenClass,
                    filter: '.not-draggable'
                });
            }
        });
    }

    //Removing sortable from each items of task board.
    willDestroy() {
        let _self = this;
        _self.sortableList.forEach((el) => {
            el.destroy();
        });
        
        _self._cleanupMilestoneTabSortables();
    }
}
