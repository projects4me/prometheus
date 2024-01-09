/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from "prometheus/config/environment";
import { singularize } from 'ember-inflector';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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
     * This function is called when an exisiting record is updated (PATCH). By default on PATCH call, ember data sends attributes
     * to the server which are not even updated. We are overriding this function in order to just add updated attributes
     * of a model to request payload.
     * 
     * @param {*} store 
     * @param {*} schema 
     * @param {*} snapshot 
     * @returns 
     */
    updateRecord(store, schema, snapshot) {
        let data = {};
        const type = snapshot.modelName;
        const serializer = store.serializerFor(type);

        serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

        const id = snapshot.id;
        const url = this.buildURL(type, id, snapshot, 'updateRecord');

        //pick only updated attributes
        let updateAttributes = _.pick(data.data.attributes, Object.keys(snapshot.changedAttributes()));
        data.data.attributes = updateAttributes;

        if(_.isEmpty(updateAttributes)) {
            return;
        }
        return this.ajax(url, 'PATCH', { data: data });
    }
}