/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { referenceImageSources } from 'prometheus/utils/upload-reference';

/**
 * The message shown for each reason an image upload can fail
 */
const IMAGE_ERROR_KEYS = {
    type: 'views.app.idea.conversation.image.type',
    size: 'views.app.idea.conversation.image.size',
    upload: 'views.app.idea.conversation.image.upload'
};

/**
 * The composer of the conversation of an idea. Ctrl+Enter or the Send button sends the message, Enter adds a new line.
 * It only collects the text, @onSend creates the message. A pasted or dropped image is uploaded as an upload of
 * the idea (@ideaId) and kept in the text as ![<file name>](upload:<uploadId>).
 *
 * @class IdeaComposerComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaComposerComponent extends Component {
    /**
     * PubSub service, used to clear the editor after a message was sent
     *
     * @property pubSub
     * @type Ember.Service
     * @private
     */
    @service pubSub;

    /**
     * Uploads pasted and dropped images
     *
     * @property imageUpload
     * @type Ember.Service
     * @private
     */
    @service imageUpload;

    /**
     * Translates the error of an image that was not uploaded
     *
     * @property intl
     * @type Ember.Service
     * @private
     */
    @service intl;

    /**
     * The number of images being uploaded
     *
     * @property uploadingImages
     * @type Number
     * @private
     */
    @tracked uploadingImages = 0;

    /**
     * Why the last image was not uploaded
     *
     * @property imageError
     * @type String
     * @private
     */
    @tracked imageError = null;

    /**
     * The upload reference of each image in the editor, by the address the editor shows it with
     *
     * @property imageReferences
     * @type Map
     * @private
     */
    imageReferences = new Map();

    /**
     * The pubSub event which clears this composer's editor only
     *
     * @property clearEvent
     * @type String
     * @private
     */
    clearEvent = `clearContents-${guidFor(this)}`;

    /**
     * The text being written
     *
     * @property body
     * @type String
     * @private
     */
    @tracked body = '';

    /**
     * Whether a message is being sent
     *
     * @property isSending
     * @type Boolean
     * @private
     */
    @tracked isSending = false;

    /**
     * The composer is disabled while sending and when the idea is archived
     *
     * @property isDisabled
     * @type Boolean
     * @public
     */
    get isDisabled() {
        return this.isSending || Boolean(this.args.disabled);
    }

    /**
     * Whether an image is being uploaded
     *
     * @property isUploading
     * @type Boolean
     * @public
     */
    get isUploading() {
        return this.uploadingImages > 0;
    }

    /**
     * Sending waits until the images are uploaded
     *
     * @property isSendDisabled
     * @type Boolean
     * @public
     */
    get isSendDisabled() {
        return this.isDisabled || this.isUploading;
    }

    /**
     * Keeps the text in step with the editor, which emits markdown. The images are kept as their upload references.
     *
     * @method updateBody
     * @param {String} markdown
     * @public
     */
    @action
    updateBody(markdown) {
        this.body = referenceImageSources(markdown, this.imageReferences);
    }

    /**
     * Uploads a pasted or dropped image as an upload of the idea. The editor shows it from the local file.
     * An upload that ends after the composer was destroyed is ignored.
     *
     * @method addImage
     * @param {Blob} blob
     * @returns {Promise} resolves to `{ url, alt }` to insert, or to null when the image was not uploaded
     * @public
     */
    @action
    async addImage(blob) {
        this.imageError = null;
        this.uploadingImages++;
        try {
            let image = await this.imageUpload.upload(blob, 'idea', this.args.ideaId);
            // The composer may be gone by now; it would never free the local file nor the editor show the image
            if (this.isDestroying || this.isDestroyed) {
                return null;
            }
            let url = URL.createObjectURL(blob);
            this.imageReferences.set(url, image.reference);
            return { url, alt: image.name.replace(/[[\]()]/g, '') };
        } catch (error) {
            if (this.isDestroying || this.isDestroyed) {
                return null;
            }
            let key = IMAGE_ERROR_KEYS[error.reason] ?? IMAGE_ERROR_KEYS.upload;
            this.imageError = this.intl.t(key, {
                size: Math.round(this.imageUpload.maxFileSize / 1024 / 1024)
            });
            return null;
        } finally {
            this.uploadingImages--;
        }
    }

    /**
     * Ctrl+Enter sends, unless it only picked an item of the editor's suggestion menu
     *
     * @method handleKeyboardSubmit
     * @param {String} content
     * @param {Boolean} canSubmit
     * @public
     */
    @action
    handleKeyboardSubmit(content, canSubmit) {
        if (canSubmit) {
            this.send();
        }
    }

    /**
     * Sends the text and clears it when the message was created
     *
     * @method send
     * @returns {Promise}
     * @public
     */
    @action
    async send() {
        let body = (this.body ?? '').trim();
        if (this.isSendDisabled || !body) {
            return;
        }
        this.isSending = true;
        try {
            await this.args.onSend(body);
            this.body = '';
            this.imageError = null;
            this.pubSub.trigger(this.clearEvent);
            this.releaseImages();
        } catch (error) {
            // Already reported by the controller. Keep the text so the user can retry.
        } finally {
            this.isSending = false;
        }
    }

    /**
     * Frees the local files the editor showed the images from
     *
     * @method releaseImages
     * @private
     */
    releaseImages() {
        this.imageReferences.forEach((reference, url) => URL.revokeObjectURL(url));
        this.imageReferences.clear();
    }

    willDestroy() {
        super.willDestroy(...arguments);
        this.releaseImages();
    }
}
