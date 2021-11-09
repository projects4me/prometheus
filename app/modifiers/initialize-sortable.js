import Modifier from 'ember-modifier';
import Sortable from 'sortablejs';
import { action } from '@ember/object';

/**
 * This modifier is called on the initialization of taskboard component and SortableJS
 * is attached to every items inside that taskboard in order to make it draggable.
 *
 * @class InitializeSortable
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class InitializeSortable extends Modifier {

    /**
     * This function returns group name.
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
     * near the mouse will be to an edge to start scrolling.
     *
     * @method get
     * @return integer
     * @public
     */
    get scrollSensitivity() {
        return this.args.named.scrollSensitivity;
    }

    /**
     * This function returns scrolling speed in px.
     *
     * @method get
     * @return integer
     * @public
     */
     get scrollSpeed() {
        return this.args.named.scrollSpeed;
    }

    /**
     * This function returns sort value. If set to true then items will be sorted.
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
     * This property is used to keep in track that whether element is dragging or not.
     *
     * @property isDragging
     * @type boolean
     * @private
     */
    isDragging = false;

    /**
     * This property contains array of sortable objects.
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
                    _self.isDragging = true;
                    _self.selectDropzones(evt);
                },
                onEnd: (evt) => {
                    _self.unSelectDropzones(evt);
                    _self.setParentHeight();
                    _self.isDragging = false;
                    _self.oldLane = null;
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
     * This function highlight dropzones related to current selected element and
     * attach mouse enter and leave event to that element.
     * @method selectDropzones
     * @param {Object} evt 
     */
    @action selectDropzones(evt) {
        let _self = this;
        evt.from.classList.add('curr-lane');
        let droppableSections = document.querySelectorAll(`div.lane.box-body`);
        droppableSections.forEach((node) => {
            (node.getAttribute('data-field-lane-group') === _self.groupName) && node.classList.add('box-body-border');
        })
    }
    
    /**
     * This function removes highlighted dropzones related to current selected element and
     * removes mouse enter and leave event to that element.
     * @method unSelectDropzones
     * @param {Object} evt 
     * @param {HTMLElement} el 
     */
    @action unSelectDropzones(evt) {
        let _self = this;
        evt.from.classList.remove('curr-lane');
        let droppableSections = document.querySelectorAll(`div.lane.box-body`);
        droppableSections.forEach((node) => {
            node.classList.remove('box-body-border');
            node.classList.remove('box-body-color');
        })
    }

    /**
     * This function is called when an item of one lane is shifted to another lane
     * and is used to set the height of parent element by getting max size of
     * lane and set it to its parent element.
     * @method setParentHeight
     */
    setParentHeight() {
        let parentElArray = document.querySelectorAll('div.board.row > div > div.box > div.box-body');
        parentElArray.forEach((parentElement) => {
            let lanes = [...parentElement.children];
            let heightArray = [];
            lanes.forEach((lane) => {
                let laneBody = lane.querySelector('div.lane.box-body');
                let items = [...laneBody.children];
                let sum = 0;
                items.forEach((item) => {
                    let padding = 3.2;
                    sum += item.getBoundingClientRect().height + padding;
                })
                heightArray.push(sum);
            });
            let max = (Math.max(...heightArray) + 85);

            //set height of lane dropzones
            lanes.forEach((lane) => {
                let headerHeight = lane.querySelector('div.box-header').getBoundingClientRect().height;
                let dropzone = lane.querySelector('div.lane.box-body');
                let height = max - headerHeight - 20;
                (height < 100) && (height = 450);
                dropzone.style.height = `${height}px`;
            });
            (max < 450) && (max = 510);
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
