import Modifier from 'ember-modifier';
import Sortable from 'sortablejs';

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
 * @author Rana Nouman <ranamnouman@yahoo.com>
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
                }
            }));
        });
        _self.setParentHeight();
    }

    /**
     * This function is bind with onStart function of the sortablejs. This function
     * will be triggered when user will start the dragging of an item from taskboard.
     * 
     * @method _onStart
     * @param {Object} evt 
     */
    _onStart(evt) {
        let _self = this;
        _self.selectDropzones(evt);
    }

    /**
     * This function is bind with onEnd function of the sortablejs. This function
     * will be triggered when dragging of an item is stopped by user.
     * 
     * @method _onEnd
     * @param {Object} evt 
     */
    _onEnd(evt) {
        let _self = this;
        _self.unSelectDropzones(evt);
        _self.setParentHeight();
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
        })
    }

    /**
     * This function removes highlighted dropzones related to current selected item. It is called on 'onEnd'
     * function of the sortablejs and that function is called when user just stops the dragging of an
     * item.
     * 
     * @method unSelectDropzones
     * @param {Object} evt 
     * @param {HTMLElement} el 
     */
    unSelectDropzones(evt) {
        evt.from.classList.remove('curr-lane');
        let droppableSections = document.querySelectorAll(`div.lane.box-body`);
        droppableSections.forEach((node) => {
            node.classList.remove('box-body-border');
            node.classList.remove('box-body-color');
        })
    }

    /**
     * This function is called when an item of one lane is shifted to another lane (onEnd function of sortablejs)
     * and is used to set the height of parent element by getting max size of a lane and that max is set it to its
     * parent element. Parent element is a section which contain lanes. Firstly this function will be called on the 
     * initialization of this modifier (on didInstall function) to set the every sections of milestone.
     * 
     * @method setParentHeight
     */
    setParentHeight() {
        let parentElArray = document.querySelectorAll('div.milestone.box-body');
        parentElArray.forEach((parentElement) => {
            let parentHeaderHeight = parentElement.parentNode.querySelector('div.box-header').getBoundingClientRect().height;
            let lanes = [...parentElement.children];
            let heightArray = [];
            lanes.forEach((lane) => {
                let laneBody = lane.querySelector('div.lane.box-body');
                let items = [...laneBody.children];
                let sum = 0;
                items.forEach((item) => {
                    let itemCSS = getComputedStyle(item);
                    sum += item.getBoundingClientRect().height + parseFloat(itemCSS.marginTop);
                })
                heightArray.push(sum);
            });
            let max = (Math.max(...heightArray) + (parentHeaderHeight * 2));
            let minHeight = 0;
            //set height of lanes
            lanes.forEach((lane) => {
                let headerHeight = lane.querySelector('div.box-header').getBoundingClientRect().height;
                let laneBody = lane.querySelector('div.lane.box-body');
                minHeight = parseFloat(getComputedStyle(laneBody).minHeight);
                let height = max - (headerHeight + parentHeaderHeight);
                (height < minHeight) && (height = minHeight);
                laneBody.style.height = `${height}px`;
            });
            (max < minHeight) && (max = minHeight + 60);
            parentElement.style.height = `${max}px`;
        })
    }

    //Removing sortable from each items of task board.
    willDestroy() {
        let _self = this;
        _self.sortableList.forEach((el) => {
            el.destroy();
        });
    }
}
