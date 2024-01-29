/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Transform from '@ember-data/serializer/transform';

/**
 * This transform is used to serialize and deserialize the data in JSON format.
 *
 * @class JsonTransform
 * @namespace Prometheus.Transforms
 * @extends DS.Transform
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class JsonTransform extends Transform {

    /**
     * Deserializes a given serialized object, parsing each value as JSON.
     * @param {Object} serialized - The serialized object to be deserialized.
     * @returns {Array} - An array containing the deserialized data.
     */
    deserialize(serialized) {
        let data = [];
        for (const [key, value] of Object.entries(serialized)) {
            data[key] = JSON.parse(value);
        }

        return data;
    }
}
