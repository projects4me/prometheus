/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import Editor from '@toast-ui/editor';
import { inject as service } from '@ember/service';
import Logger from 'js-logger';
import { replaceUploadImages, uploadImageIds } from 'prometheus/utils/upload-reference';

/**
 * Renders markdown into the element with the toastui viewer. The viewer sanitizes the html it produces,
 * so script content of a message is never executed.
 *
 * Images kept as upload references (![name](upload:<id>)) are shown by their name first, then as images once
 * their addresses resolve. An upload that can't be read stays its name. A click on an image opens the full size.
 *
 * @class RenderMarkdown
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class RenderMarkdown extends Modifier {
    /**
     * Resolves the addresses of the uploads
     *
     * @property uploadPreview
     * @type Ember.Service
     * @private
     */
    @service uploadPreview;

    /**
     * The viewer of the element
     *
     * @property viewer
     * @type Object
     * @private
     */
    viewer = null;

    /**
     * The markdown being shown, an address resolved for older markdown is dropped
     *
     * @property markdown
     * @type String
     * @private
     */
    markdown = null;

    /**
     * The upload id of each shown image, by its address
     *
     * @property imageUploads
     * @type Map
     * @private
     */
    imageUploads = new Map();

    /**
     * Creates the viewer on the first run and updates its markdown on the next ones
     *
     * @method didReceiveArguments
     * @private
     */
    didReceiveArguments() {
        let markdown = this.args.positional[0] ?? '';
        this.markdown = markdown;
        this.show(replaceUploadImages(markdown, alt => alt));
        let uploadIds = uploadImageIds(markdown);
        if (uploadIds.length) {
            this.showImages(markdown, uploadIds);
        }
    }

    /**
     * Shows the markdown in the viewer
     *
     * @method show
     * @param {String} markdown
     * @private
     */
    show(markdown) {
        if (this.viewer) {
            this.viewer.setMarkdown(markdown);
            return;
        }
        this.viewer = Editor.factory({
            el: this.element,
            viewer: true,
            useDefaultHTMLSanitizer: true,
            initialValue: markdown
        });
        this.element.addEventListener('click', this.openImage);
    }

    /**
     * Resolves the addresses of the uploads and shows their images
     *
     * @method showImages
     * @param {String} markdown
     * @param {Array} uploadIds
     * @private
     */
    async showImages(markdown, uploadIds) {
        let addresses = {};
        await Promise.all(uploadIds.map(async (uploadId) => {
            try {
                addresses[uploadId] = await this.uploadPreview.previewUrl(uploadId);
            } catch (e) {
                Logger.error('RenderMarkdown->showImages ' + e);
            }
        }));
        if (!this.viewer || this.markdown !== markdown) {
            return;
        }
        this.imageUploads.clear();
        Object.entries(addresses).forEach(([uploadId, address]) => this.imageUploads.set(address, uploadId));
        this.show(replaceUploadImages(markdown, (alt, uploadId) => {
            return addresses[uploadId] ? `![${alt}](${addresses[uploadId]})` : alt;
        }));
    }

    /**
     * Opens the full size of a clicked upload image in a new tab. The tab is opened during the click, before
     * the download token is fetched, so popup blockers allow it.
     *
     * @method openImage
     * @param {Event} event
     * @private
     */
    openImage = async (event) => {
        let uploadId = event.target.tagName === 'IMG' && this.imageUploads.get(event.target.getAttribute('src'));
        if (!uploadId) {
            return;
        }
        event.preventDefault();
        let tab = window.open('', '_blank');
        if (!tab) {
            return;
        }
        try {
            tab.location.href = await this.uploadPreview.previewUrl(uploadId);
        } catch (e) {
            tab.close();
            Logger.error('RenderMarkdown->openImage ' + e);
        }
    };

    /**
     * Destroys the viewer with the element
     *
     * @method willRemove
     * @private
     */
    willRemove() {
        this.element?.removeEventListener('click', this.openImage);
        this.viewer?.remove?.();
        this.viewer = null;
    }
}
