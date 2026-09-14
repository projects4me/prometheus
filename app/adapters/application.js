/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from "prometheus/config/environment";
import { singularize } from 'ember-inflector';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AdapterError from '@ember-data/adapter/error';
import ForbiddenError from './errors/forbidden-error';
import UnauthorizedError from './errors/unauthorized-error';

/**
 * This is the application adapter that fetches the information from the API.
 * In order to be able to handle data effectively we are using the JSONAPI
 * standards.
 *
 * @class Application
 * @namespace Prometheus.Adapter
 * @uses DataAdapterMixin
 * @todo retrieve the host name from the configurations.
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ApplicationAdapter extends JSONAPIAdapter {
    @tracked namespace = 'api/v' + ENV.api.version;
    @tracked host = ENV.api.host;

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Application
     * @public
     */
    @service session;

    /**
     * Hermes client used to mark REST writes so this tab can drop its own
     * domain:event echo.
     *
     * @property hermes
     * @type Ember.Service
     * @for Application
     * @public
     */
    @service hermes;

    /**
     * Last response meta
     * @type {Object}
     * @public
     */
    lastResponseMeta = {};

    get headers() {
        const headers = {};
        if (this.session.isAuthenticated) {
            headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
        }
        return headers;
    }

    pathForType(modelname) {
        return singularize(modelname);
    }

    /**
     * Creates a record and notes the local write (before and after the XHR)
     * so Hermes can drop this tab's domain:event echo.
     * 
     * @method createRecord
     * @param {*} store 
     * @param {Object} type - The type of the record to be created
     * @param {Object} snapshot - The snapshot of the record to be created
     * @returns {Object} The data of the created record
     */
    createRecord(store, type, snapshot) {
        const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
        const serializer = store.serializerFor(type.modelName);
        let data = {};
        serializer.serializeIntoHash(data, type.modelName, snapshot, { includeId: true });
        if (snapshot.adapterOptions) {
            data.meta = {
                ...data.meta,
                ...snapshot.adapterOptions
            };
        }
        this.noteLocalWrite(type.modelName, snapshot.id);
        return this.ajax(url, 'POST', { data }).then((payload) => {
            this.noteLocalWrite(type.modelName, snapshot.id || payload?.data?.id);
            return payload;
        });
    }    

    /**
     * Updates a record with only changed attributes (PATCH). Notes the local
     * write so Hermes can drop this tab's domain:event echo.
     * 
     * @method updateRecord
     * @param {*} store 
     * @param {*} schema 
     * @param {*} snapshot 
     * @param {Object} moreUpdatedAttributes - Additional attributes to be updated
     * @returns 
     */
    updateRecord(store, schema, snapshot, moreUpdatedAttributes) {
        let data = {};
        const type = snapshot.modelName;
        const serializer = store.serializerFor(type);

        serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

        const id = snapshot.id;
        const url = this.buildURL(type, id, snapshot, 'updateRecord');

        //pick only updated attributes
        let updatedAttributes = _.pick(data.data.attributes, Object.keys(snapshot.changedAttributes()));
        data.data.attributes = updatedAttributes;

        if (_.isEmpty(updatedAttributes)) {
            return false;
        }

        if (moreUpdatedAttributes) {
            updatedAttributes = _.assign(updatedAttributes, moreUpdatedAttributes);
            data.data.attributes = updatedAttributes;
        }

        this.noteLocalWrite(type, id);
        return this.ajax(url, 'PATCH', { data: data });
    }

    /**
     * This hook is triggered when user got response against an API call. We're using this hook to set and return object
     * of type AdapterError if user get an error as a response against an API call.
     * 
     * @method handleResponse
     * @param {*} status 
     * @param {*} headers 
     * @param {*} payload 
     * @param {*} requestData 
     * @returns {Object}
     */
    handleResponse(status, headers, payload, requestData) {
        if (!this.isSuccess(status, headers, payload)) {
            return this._createErrorResponse(status, payload);
        }
        super.init(status, headers, payload, requestData);
        this.lastResponseMeta = payload.meta;
        return payload;
    }

    /**
     * This method is called when server throws an error against the API call. In this method we're creating the adapter error
     * object according to the type of status code.
     * 
     * @param {number} status 
     * @param {Object} payload 
     * @returns {Object}
     */
    _createErrorResponse(status, payload) {
        let adapterError = null;
        switch (status) {
            case 401:
                adapterError = new UnauthorizedError('Unauthorized request');
                break;
            case 403:
                adapterError = new ForbiddenError(payload.error);
                break;
            default:
                adapterError = new AdapterError(payload.error);
                break;
        }

        return adapterError;
    }

    /**
     * Builds the URL for deleting a record, with optional query parameters.
     * 
     * @param {string|number} id - The ID of the record to be deleted
     * @param {string} modelName - The name of the model
     * @param {object} snapshot - The snapshot containing adapter options
     * @returns {string} The complete URL for the delete operation
     * @override
     */
    urlForDeleteRecord(id, modelName, snapshot) {
        let baseUrl = super.urlForDeleteRecord(...arguments);
        const queryParams = snapshot?.adapterOptions?.queryParams || {};
        
        if (Object.keys(queryParams).length > 0) {
          baseUrl = `${baseUrl}?${new URLSearchParams(queryParams)}`;
        }
        
        return baseUrl;
    }

    /**
     * Note the delete before the request so the live echo cannot beat the XHR.
     *
     * @method deleteRecord
     * @param {Object} store Ember Data store
     * @param {Object} type Model class / type info
     * @param {Object} snapshot Record snapshot being deleted
     * @returns {Promise}
     * @public
     */
    deleteRecord(store, type, snapshot) {
        this.noteLocalWrite(type.modelName, snapshot.id);
        return super.deleteRecord(store, type, snapshot);
    }

    /**
     * Record a REST write this tab originated so hermes can drop the echo.
     *
     * @method noteLocalWrite
     * @param {String} type Ember Data model name
     * @param {String} id Record id
     * @returns {void}
     * @private
     */
    noteLocalWrite(type, id) {
        if (type && id) {
            this.hermes?.noteLocalWrite(type, id);
        }
    }

    /**
     * Ensures a fresh access token before API calls and retries once after a
     * forced refresh on 401 / UnauthorizedError.
     *
     * @param {String} url - The URL to make the request to
     * @param {String} type - The type of the request
     * @param {Object} options - The options for the request
     * @param {Boolean} [isUnauthorizedRetry=false] - Internal retry guard
     * @returns {Promise} The response from the server
     * @method ajax
     */
    async ajax(url, type, options, isUnauthorizedRetry = false) {
        if (this.session.isAuthenticated) {
            await this.session.ensureFreshToken();
        }

        try {
            return await super.ajax(url, type, options);
        } catch (error) {
            if (
                !isUnauthorizedRetry &&
                error instanceof UnauthorizedError &&
                this.session.isAuthenticated
            ) {
                await this.session.ensureFreshToken({ force: true });
                return this.ajax(url, type, options, true);
            }

            throw error;
        }
    }
}