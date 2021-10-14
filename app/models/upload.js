/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * The upload model
 *
 * @class Upload
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * File name
     *
     * @property name
     * @type String
     * @for Upload
     * @private
     */
    name: attr('string'),

    /**
     * The timestamp on which the file was uploaded
     *
     * @property dateCreated
     * @type String
     * @for Upload
     * @private
     */
    dateCreated: attr('string'),

    /**
     * The date on which the upload was modified
     *
     * @property dateModified
     * @type String
     * @for Upload
     * @private
     */
    dateModified: attr('string'),

    /**
     * The identifier of the user who uploaded this file
     *
     * @property createdUser
     * @type String
     * @for Upload
     * @private
     */
    createdUser: attr('string'),

    /**
     * The identifier of the user who last modified this file
     *
     * @property modifiedUser
     * @type String
     * @for Upload
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The status of the upload
     *
     * @property status
     * @type String
     * @for Upload
     * @private
     */
    status: attr('string'),

    /**
     * The identifier of the record this file is uploaded against
     *
     * @property relatedId
     * @type String
     * @for Upload
     * @private
     */
    relatedId: attr('string'),

    /**
     * The type of the file
     *
     * @property fileType
     * @type String
     * @for Upload
     * @private
     */
    fileType: attr('string'),
    /**
     * The size of the file uploaded
     *
     * @property fileSize
     * @type String
     * @for Upload
     * @private
     */
    fileSize: attr('string'),

    /**
     * The MIME of the file uploaded
     *
     * @property fileMime
     * @type String
     * @for Upload
     * @private
     */
    fileMime: attr('string'),

    /**
     * The local path on which the file is stored
     *
     * @property filePath
     * @type String
     * @for Upload
     * @private
     */
    filePath: attr('string'),

    /**
     * Does this file have a thumbnail
     *
     * @property fileThumbnail
     * @type String
     * @for Upload
     * @private
     */
    fileThumbnail: attr('string'),

    /**
     * Where is this file stored.
     *
     * @property fileDestination
     * @type String
     * @for Upload
     * @private
     */
    fileDestination: attr('string'),

    /**
     * This is the download token to be used for download
     *
     * @property downloadLink
     * @type String
     * @for Upload
     * @private
     */
    downloadLink: attr('string'),
    
    /**
     * The user who uploaded this file
     *
     * @property createdBy
     * @type UserModel
     * @for Upload
     * @private
     */
    createdBy: belongsTo('user'),

    /**
     * The user who last modified this uploaded file
     *
     * @property modifiedBy
     * @type UserModel
     * @for Upload
     * @private
     */
    modifiedBy: belongsTo('user')

});