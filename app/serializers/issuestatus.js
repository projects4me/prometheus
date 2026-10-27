/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationSerializer from 'prometheus/serializers/application';

/**
 * The issue status serializer. Keeps the read-only issueCount (returned by
 * Gaia on request) out of the create and update payloads, and sends the
 * labels (`translations`) only when they changed, so saving the order of the
 * statuses doesn't rewrite their labels.
 *
 * @class Issuestatus
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
        issueCount: { serialize: false }
    },

    /**
     * Leaves the labels out of the payload unless they changed.
     *
     * @method serializeAttribute
     * @param {Snapshot} snapshot
     * @param {Object} json
     * @param {String} key
     * @param {Object} attribute
     * @protected
     */
    serializeAttribute(snapshot, json, key, attribute) {
        if (key === 'translations' && !('translations' in snapshot.changedAttributes())) {
            return;
        }

        this._super(...arguments);
    }
});
