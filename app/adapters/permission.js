/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationAdapter from './application';
import PermissionAdapterError from './errors/permission-adapter-error';

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
     * Handles save() for both new grants (POST) and existing grants (PATCH).
     * Creates are detected via the ephemeral shouldCreate flag set on the
     * role page before roleId is assigned.
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
        const id = snapshot.id;

        if (snapshot.record.shouldCreate) {
            requestMethod = 'POST';
            adapterMethod = 'createRecord';
        }

        let updatedAttributes = _.pick(data.data.attributes, Object.keys(snapshot.changedAttributes()));
        // resourceName, roleId, and allowed are required by server to create or update permission.
        updatedAttributes['resourceName'] = data.data.attributes.resourceName;
        updatedAttributes['roleId'] = data.data.attributes.roleId;
        updatedAttributes['allowed'] = data.data.attributes.allowed;
        data.data.attributes = updatedAttributes;
        if (_.isEmpty(updatedAttributes)) {
            return false;
        }
        const url = this.buildURL(type, id, snapshot, adapterMethod);
        return this.ajax(url, requestMethod, { data: data }).then((response) => {
            snapshot.record.shouldCreate = false;
            return response;
        });
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
