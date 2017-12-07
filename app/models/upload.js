/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The upload model
 *
 * @class Upload
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * File name
     *
     * @property name
     * @type String
     * @for Upload
     * @private
     */
    name: DS.attr('string'),

    /**
     * The timestamp on which the file was uploaded
     *
     * @property dateCreated
     * @type String
     * @for Upload
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * The date on which the upload was modified
     *
     * @property dateModified
     * @type String
     * @for Upload
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The identifier of the user who uploaded this file
     *
     * @property createdUser
     * @type String
     * @for Upload
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The identifier of the user who last modified this file
     *
     * @property modifiedUser
     * @type String
     * @for Upload
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The status of the upload
     *
     * @property status
     * @type String
     * @for Upload
     * @private
     */
    status: DS.attr('string'),

    /**
     * The identifier of the record this file is uploaded against
     *
     * @property relatedId
     * @type String
     * @for Upload
     * @private
     */
    relatedId: DS.attr('string'),

    /**
     * The type of the file
     *
     * @property fileType
     * @type String
     * @for Upload
     * @private
     */
    fileType: DS.attr('string'),
    /**
     * The size of the file uploaded
     *
     * @property fileSize
     * @type String
     * @for Upload
     * @private
     */
    fileSize: DS.attr('string'),

    /**
     * The MIME of the file uploaded
     *
     * @property fileMime
     * @type String
     * @for Upload
     * @private
     */
    fileMime: DS.attr('string'),

    /**
     * The local path on which the file is stored
     *
     * @property filePath
     * @type String
     * @for Upload
     * @private
     */
    filePath: DS.attr('string'),

    /**
     * Does this file have a thumbnail
     *
     * @property fileThumbnail
     * @type String
     * @for Upload
     * @private
     */
    fileThumbnail: DS.attr('string'),

    /**
     * Where is this file stored.
     *
     * @property fileDestination
     * @type String
     * @for Upload
     * @private
     */
    fileDestination: DS.attr('string')

});