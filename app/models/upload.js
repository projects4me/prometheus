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
export default class UploadModel extends Model {

    /**
     * File name
     *
     * @property name
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') name;

    /**
     * The timestamp on which the file was uploaded
     *
     * @property dateCreated
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the upload was modified
     *
     * @property dateModified
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') dateModified;

    /**
     * The identifier of the user who uploaded this file
     *
     * @property createdUser
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') createdUser;

    /**
     * The identifier of the user who last modified this file
     *
     * @property modifiedUser
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The status of the upload
     *
     * @property status
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') status;

    /**
     * The identifier of the record this file is uploaded against
     *
     * @property relatedId
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') relatedId;

    /**
     * The type of the file
     *
     * @property fileType
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') fileType;
    /**
     * The size of the file uploaded
     *
     * @property fileSize
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') fileSize;

    /**
     * The MIME of the file uploaded
     *
     * @property fileMime
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') fileMime;

    /**
     * The local path on which the file is stored
     *
     * @property filePath
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') filePath;

    /**
     * Does this file have a thumbnail
     *
     * @property fileThumbnail
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') fileThumbnail;

    /**
     * Where is this file stored.
     *
     * @property fileDestination
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') fileDestination;

    /**
     * This is the download token to be used for download
     *
     * @property downloadLink
     * @type String
     * @for Upload
     * @private
     */
    @attr('string') downloadLink;
    
    /**
     * The user who uploaded this file
     *
     * @property createdBy
     * @type UserModel
     * @for Upload
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user who last modified this uploaded file
     *
     * @property modifiedBy
     * @type UserModel
     * @for Upload
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

}