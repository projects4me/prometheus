/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';

/**
 * A full-screen modal overlay that wraps Cropper.js for profile picture cropping.
 * The component enforces a 1:1 aspect ratio (square) and exports the cropped
 * result as a JPEG base64 data URI when the user confirms their selection.
 *
 * Expected arguments:
 *   @imageSrc   {String}   - data URL of the raw image to crop
 *   @onApply    {Function} - called with the cropped base64 string on confirm
 *   @onCancel   {Function} - called when the user dismisses the modal
 *
 * @class UserProfilePictureCropperComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserProfilePictureCropperComponent extends AppComponent {

    /**
     * Holds the Cropper.js instance received from the initialize-cropper
     * modifier so it can be used by the Apply action.
     *
     * @property cropperInstance
     * @type {Cropper|null}
     * @private
     */
    cropperInstance = null;

    /**
     * Called by the initialize-cropper modifier once the Cropper instance is
     * ready. Stores the reference so apply() can call getCroppedCanvas().
     *
     * @method setCropper
     * @param {Cropper} instance
     * @public
     */
    @action setCropper(instance) {
        this.cropperInstance = instance;
    }

    /**
     * Reads the current crop selection from Cropper.js, converts it to a
     * 300×300 JPEG base64 data URI, and passes it to the @onApply callback.
     *
     * @method apply
     * @public
     */
    @action apply() {
        if (!this.cropperInstance) {
            return;
        }

        const canvas = this.cropperInstance.getCroppedCanvas({ width: 300, height: 300 });

        if (!canvas) {
            return;
        }

        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        this.args.onApply(base64);
    }

    /**
     * Dismisses the cropper modal without saving any changes.
     *
     * @method cancel
     * @public
     */
    @action cancel() {
        this.args.onCancel();
    }
}
