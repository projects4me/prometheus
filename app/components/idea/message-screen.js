/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Logger from 'js-logger';

/**
 * One screen of an idea message: its full image with the title and version. A click opens the full image in a modal.
 *
 * @class IdeaMessageScreenComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaMessageScreenComponent extends Component {
    @service uploadPreview;

    /**
     * The address of the full image of the upload
     *
     * @property imageUrl
     * @type String
     * @private
     */
    @tracked imageUrl = null;

    /**
     * Whether the full size modal is open
     *
     * @property previewOpen
     * @type Boolean
     * @private
     */
    @tracked previewOpen = false;

    /**
     * The address of the full image shown in the modal
     *
     * @property previewUrl
     * @type String
     * @private
     */
    @tracked previewUrl = null;

    /**
     * Counts the preview requests so a late answer to a closed or replaced one is ignored
     *
     * @property previewRequest
     * @type Number
     * @private
     */
    previewRequest = 0;

    /**
     * The link that opened the modal, focused again when the modal closes
     *
     * @property opener
     * @type HTMLElement
     * @private
     */
    opener = null;

    /**
     * Whether the modal image could not be loaded
     *
     * @property previewFailed
     * @type Boolean
     * @private
     */
    @tracked previewFailed = false;

    constructor() {
        super(...arguments);
        this.loadImage();
    }

    /**
     * Loads the full image, without it the placeholder and the title are still shown
     *
     * @method loadImage
     * @private
     */
    async loadImage() {
        try {
            let url = await this.uploadPreview.previewUrl(this.args.screen.uploadId);
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.imageUrl = url;
        } catch (e) {
            Logger.error('IdeaMessageScreenComponent->loadImage ' + e);
        }
    }

    /**
     * Shows the placeholder when the image can't be loaded
     *
     * @method imageFailed
     * @public
     */
    @action
    imageFailed() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.imageUrl = null;
    }

    /**
     * Opens the full image in a modal on the page. Each opening gets a fresh address, the download
     * tokens are single use and the inline image has used its own.
     *
     * @method open
     * @param {Event} event
     * @public
     */
    @action
    async open(event) {
        event.preventDefault();
        this.opener = event.currentTarget;
        this.previewFailed = false;
        this.previewUrl = null;
        this.previewOpen = true;
        let request = ++this.previewRequest;
        try {
            let url = await this.uploadPreview.previewUrl(this.args.screen.uploadId);
            if (this.isDestroying || this.isDestroyed || request !== this.previewRequest) {
                return;
            }
            this.previewUrl = url;
        } catch (e) {
            Logger.error('IdeaMessageScreenComponent->open ' + e);
            if (this.isDestroying || this.isDestroyed || request !== this.previewRequest) {
                return;
            }
            this.previewFailed = true;
        }
    }

    /**
     * Shows the placeholder when the modal image can't be displayed
     *
     * @method previewImageFailed
     * @public
     */
    @action
    previewImageFailed() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.previewFailed = true;
    }

    /**
     * Closes the modal
     *
     * @method closePreview
     * @public
     */
    @action
    closePreview() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.previewRequest++;
        this.previewOpen = false;
        this.previewUrl = null;
        if (this.opener && this.opener.isConnected) {
            this.opener.focus();
        }
        this.opener = null;
    }
}
