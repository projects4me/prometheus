/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationAdapter from './application';
import PermissionAdapterError from '../errors/permission-adapter-error';

/**
 * This is the JSONAPI adapter for permission model.
 *
 * @class PermissionAdapter
 * @namespace Prometheus.Adapter
 * @extends ApplicationAdapter
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class PermissionAdapter extends ApplicationAdapter {

    /**
     * This function is called when an exisiting record of permission is updated. There are two types of permissions
     * fetched from the API, the first one is the default permission of the resource which is not created and the second
     * one is the permission of the resource fetched from the database. This function handles a save() call in a way
     * it make POST request call for the permission which is going to be created and make the PATCH call for the permission
     * which is already created and a patch of it is yet to be updated.
     * 
     * @method updateRecord
     * @param {*} store 
     * @param {*} schema 
     * @param {*} snapshot 
     * @returns {Promise}
     */
    updateRecord(store, schema, snapshot) {
        let data = {};
        const type = snapshot.modelName;
        const serializer = store.serializerFor(type);
        let requestMethod = 'PATCH',
            adapterMethod = 'updateRecord';

        serializer.serializeIntoHash(data, type, snapshot, { includeId: true });
        data.data.attributes['resourceName'] = snapshot.adapterOptions.resourceName;
        const id = snapshot.id;

        if (data.data.attributes.resourceId.includes('new')) {
            // For POST CALL
            requestMethod = 'POST';
            adapterMethod = 'createRecord'
        } else {
            // For PATCH CALL
            let updateAttributes = _.pick(data.data.attributes, Object.keys(snapshot.changedAttributes()));

            if (_.isEmpty(updateAttributes)) {
                return false;
            }
        }

        const url = this.buildURL(type, id, snapshot, adapterMethod);
        return this.ajax(url, requestMethod, { data: data });
    }

    /**
     * This hook is triggered when user got response against an API call. We're using this hook for getting an error
     * object (by default we're only allow to get a plain string as an error). So if we'll get an status code of 422 
     * against an POST/PATCH call we'll return an error of PermissionAdapterError type to get a customized error
     * message.
     * 
     * @param {*} status 
     * @param {*} headers 
     * @param {*} payload 
     * @param {*} requestData 
     * @returns {Object}
     */
    handleResponse(status, headers, payload, requestData) {
        if (status === 422) {
            throw new PermissionAdapterError("Permission not created", payload);
        }
        this._super(status, headers, payload, requestData);
        return payload;
    }
}
