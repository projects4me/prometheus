/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
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
     * The resolved address of each upload, by its id, kept for the modifier's lifetime. Download tokens are
     * single use, so an image shown again keeps its address instead of fetching a new one.
     *
     * @property addresses
     * @type Map
     * @private
     */
    addresses = new Map();

    /**
     * The address lookup of each upload in progress, by its id
     *
     * @property lookups
     * @type Map
     * @private
     */
    lookups = new Map();

    /**
     * The upload id of each shown image, by its address
     *
     * @property imageUploads
     * @type Map
     * @private
     */
    imageUploads = new Map();

    /**
     * Destroys the viewer when the modifier is torn down.
     *
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     */
    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.teardown());
    }

    /**
     * Creates the viewer on the first run and updates its markdown on the next ones. It runs while the
     * template is tracked, so it reads only its argument and leaves the address lookup to a later task:
     * store state read by the lookup would otherwise make the modifier re-run each time the lookup resolves.
     *
     * @method modify
     * @param {Element} element
     * @param {Array} positional
     * @private
     */
    modify(element, [markdown = '']) {
        this.element = element;
        markdown = markdown ?? '';
        if (this.viewer && markdown === this.markdown) {
            return;
        }
        this.markdown = markdown;
        this.showWithImages(markdown);
        let missing = uploadImageIds(markdown).filter(uploadId => !this.addresses.has(uploadId));
        if (missing.length) {
            this.showImages(missing);
        }
    }

    /**
     * Shows the markdown with the images whose addresses are known, the others by their name
     *
     * @method showWithImages
     * @param {String} markdown
     * @private
     */
    showWithImages(markdown) {
        this.imageUploads.clear();
        this.show(replaceUploadImages(markdown, (alt, uploadId) => {
            let address = this.addresses.get(uploadId);
            if (!address) {
                return alt;
            }
            this.imageUploads.set(address, uploadId);
            return `![${alt}](${address})`;
        }));
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
     * Resolves the addresses of the uploads and shows their images in the markdown shown by then; markdown
     * replaced in the meantime is not shown again. The lookup starts after the current render, outside its
     * tracking frame, and an upload already being looked up is not looked up twice.
     *
     * @method showImages
     * @param {Array} uploadIds
     * @private
     */
    async showImages(uploadIds) {
        await Promise.resolve();
        let resolved = await Promise.all(uploadIds.map(uploadId => this.lookup(uploadId)));
        let shown = uploadImageIds(this.markdown);
        if (this.viewer && uploadIds.some((uploadId, i) => resolved[i] && shown.includes(uploadId))) {
            this.showWithImages(this.markdown);
        }
    }

    /**
     * Resolves the address of an upload once and keeps it, an upload that can't be read resolves to null
     *
     * @method lookup
     * @param {String} uploadId
     * @return {Promise} resolves to whether the address is known
     * @private
     */
    lookup(uploadId) {
        if (!this.lookups.has(uploadId)) {
            this.lookups.set(uploadId, this.uploadPreview.previewUrl(uploadId).then((address) => {
                if (!this.viewer) {
                    return false;
                }
                this.addresses.set(uploadId, address);
                return true;
            }, (e) => {
                Logger.error('RenderMarkdown->showImages ' + e);
                return false;
            }).finally(() => this.lookups.delete(uploadId)));
        }
        return this.lookups.get(uploadId);
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
     * @method teardown
     * @private
     */
    teardown() {
        this.element?.removeEventListener('click', this.openImage);
        this.viewer?.remove?.();
        this.viewer = null;
        this.addresses.clear();
        this.imageUploads.clear();
    }
}
