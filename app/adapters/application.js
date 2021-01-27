/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import ENV from "prometheus/config/environment";
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { singularize } from 'ember-inflector';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

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
export default class ApplicationAdapter extends DS.JSONAPIAdapter.extend(DataAdapterMixin) {
    namespace='api/v'+ENV.api.version;
    host= ENV.api.host;
    @service session;

    @computed('session.data.authenticated.access_token')
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
}