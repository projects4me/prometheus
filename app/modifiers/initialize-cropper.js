/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import Cropper from 'cropperjs';

/**
 * Attaches Cropper.js (v1) to an <img> element when it is inserted into the DOM.
 * Passes the resulting Cropper instance back to the caller via the `onInit` named
 * argument so the parent component can call `getCroppedCanvas()` on demand.
 * Destroys the instance automatically when the element is removed.
 *
 * @example
 *     <img {{initialize-cropper onInit=this.setCropper}} src="..." />
 *
 * @class InitializeCropper
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeCropper extends Modifier {

    /**
     * Holds the active Cropper.js instance so it can be destroyed on teardown.
     *
     * @property cropperInstance
     * @type {Cropper|null}
     * @private
     */
    cropperInstance = null;

    /**
     * The callback supplied by the parent component that receives the Cropper
     * instance once it has been initialised.
     *
     * @property onInit
     * @type {Function}
     * @private
     */
    get onInit() {
        return this.args.named.onInit;
    }

    /**
     * Called when the modifier is first installed on the DOM element.
     * Creates a Cropper.js instance locked to a 1:1 aspect ratio (square)
     * with the drag-to-move mode so the user pans the image inside a fixed
     * crop box.
     *
     * @method didInstall
     * @public
     */
    didInstall() {
        this.cropperInstance = new Cropper(this.element, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false
        });

        if (this.onInit) {
            this.onInit(this.cropperInstance);
        }
    }

    /**
     * Called when the modifier is removed from the DOM. Destroys the Cropper.js
     * instance to prevent memory leaks.
     *
     * @method willDestroy
     * @public
     */
    willDestroy() {
        if (this.cropperInstance) {
            this.cropperInstance.destroy();
            this.cropperInstance = null;
        }
    }
}
