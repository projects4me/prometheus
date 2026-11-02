/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import ENV from 'prometheus/config/environment';
import { fileToBase64 } from 'prometheus/utils/image-to-base64';

/**
 * The upload flow of a user's profile picture, shared by the user and agent pages: validating the chosen file,
 * reading it for the cropper and saving the cropped picture on the user.
 *
 * @class ProfilePictureService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class ProfilePictureService extends Service {
    @service intl;
    @service errorManager;

    /**
     * Validates the chosen file and reads it as base64 for the cropper. An invalid file is reported to the user.
     *
     * @method read
     * @param {Object} file The queued file
     * @return {Promise<String|null>} the base64 image, or null when the file was rejected
     */
    async read(file) {
        const { maxFileSize, allowedTypes } = ENV.app.upload.profilePicture;

        if (!allowedTypes.includes(file.file.type)) {
            this.notify('error', this.intl.t('views.app.user.profilePicture.imageTypeError', {
                types: allowedTypes.map((type) => type.split('/')[1]).join(', ')
            }).toString());
            return null;
        }

        if (file.file.size > maxFileSize) {
            this.notify('error', this.intl.t('views.app.user.profilePicture.imageSizeError', {
                limit: `${maxFileSize / (1024 * 1024)}MB`
            }).toString());
            return null;
        }

        return fileToBase64(file);
    }

    /**
     * Sets the cropped picture on the user and saves it, restoring the previous picture when the save fails.
     *
     * @method save
     * @param {Object} user
     * @param {String} croppedBase64
     * @return {Promise<Boolean>} whether the picture was saved
     */
    async save(user, croppedBase64) {
        let previousProfilePicture = user.profilePicture;
        user.profilePicture = croppedBase64;

        try {
            await user.save();
            this.notify('success', htmlSafe(this.intl.t('views.app.user.profilePicture.updated')));
            return true;
        } catch (error) {
            user.profilePicture = previousProfilePicture;
            this.errorManager.handleError(error, { moduleName: 'user' });
            return false;
        }
    }

    notify(type, message) {
        new Messenger().post({ message, type, showCloseButton: true, hideAfter: 3 });
    }
}
