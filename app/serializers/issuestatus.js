/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationSerializer from 'prometheus/serializers/application';

/**
 * The issue status serializer. Keeps the read-only issueCount (returned by
 * Gaia on request) out of the create and update payloads.
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
    }
});
