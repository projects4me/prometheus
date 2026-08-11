/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationAdapter from './application';
import PermissionAdapterError from './errors/permission-adapter-error';

/**
 * The JSONAPI adapter for the role model.
 *
 * @class RoleAdapter
 * @namespace Prometheus.Adapter
 * @extends ApplicationAdapter
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class RoleAdapter extends ApplicationAdapter {

    /**
     * Preserve Gaia Permission (422) lockout payloads so callers can show
     * both the error message and suggestion (same shape as permission writes).
     *
     * @method handleResponse
     * @param {Number} status
     * @param {Object} headers
     * @param {Object} payload
     * @param {Object} requestData
     * @returns {Object}
     */
    handleResponse(status, headers, payload, requestData) {
        if (status === 422) {
            throw new PermissionAdapterError(
                payload?.error || 'Role change rejected',
                payload
            );
        }
        return super.handleResponse(status, headers, payload, requestData);
    }
}
