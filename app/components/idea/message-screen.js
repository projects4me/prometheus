/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Logger from 'js-logger';

/**
 * One screen of an idea message: the thumbnail of its upload with the title and version. A click
 * opens the full image in a new tab.
 *
 * @class IdeaMessageScreenComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaMessageScreenComponent extends Component {
    @service uploadPreview;

    /**
     * The thumbnail address of the upload
     *
     * @property thumbnail
     * @type String
     * @private
     */
    @tracked thumbnail = null;

    constructor() {
        super(...arguments);
        this.loadThumbnail();
    }

    /**
     * Loads the thumbnail, without one the title is still shown
     *
     * @method loadThumbnail
     * @private
     */
    async loadThumbnail() {
        try {
            this.thumbnail = await this.uploadPreview.thumbnail(this.args.screen.uploadId);
        } catch (e) {
            Logger.error('IdeaMessageScreenComponent->loadThumbnail ' + e);
        }
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
