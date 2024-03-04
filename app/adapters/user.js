/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationAdapter from './application';

/**
 * This is the JSONAPI adapter for user model.
 *
 * @class UserAdapter
 * @namespace Prometheus.Adapter
 * @extends ApplicationAdapter
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserAdapter extends ApplicationAdapter {

    /**
     * This function generates and returns a custom url if the "me" object is passed to the query object.
     * If it is passed then we use urlForFindRecord() method of adapter to create a url like '/user/me'.
     * 
     * @method urlForQueryRecord
     * @param {Object} query 
     * @param {String} modelName 
     * @returns {String}
     */
    urlForQueryRecord(query, modelName) {
        let url = super.urlForQueryRecord(...arguments);

        if (query.me) {
            url = this.urlForFindRecord('me', modelName)
            delete query.me;
        }

        return url;
    }
}
