/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationSerializer from 'prometheus/serializers/application';

/**
 * The issue type serializer. Keeps the read-only projectCount (returned by
 * Gaia on request) out of the create and update payloads.
 *
 * @class Issuetype
 * @namespace Prometheus.Serializers
 * @extends Application
 */
export default ApplicationSerializer.extend({

    /**
     * Attribute serialization options
     *
     * @property attrs
     * @type Object
     * @protected
     */
    attrs: {
        projectCount: { serialize: false }
    },

    serializeAttribute(snapshot, json, key, attribute) {
        if (key === 'translations' && !('translations' in snapshot.changedAttributes())) {
            return;
        }

        this._super(...arguments);
    }
});
