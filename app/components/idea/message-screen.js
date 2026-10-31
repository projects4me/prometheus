/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Logger from 'js-logger';

/**
 * One screen of an idea message: its full image with the title and version. A click opens the full image in a new tab.
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
     * Opens the full image in a new tab. The tab is opened during the click, before the download
     * token is fetched, so popup blockers allow it.
     *
     * @method open
     * @param {Event} event
     * @public
     */
    @action
    async open(event) {
        event.preventDefault();
        let tab = window.open('', '_blank');
        try {
            let url = await this.uploadPreview.previewUrl(this.args.screen.uploadId);
            tab.location.href = url;
        } catch (e) {
            tab.close();
            Logger.error('IdeaMessageScreenComponent->open ' + e);
        }
    }
}
