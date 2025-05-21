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
        if (serialized === null || serialized === undefined) {
            return serialized;
        }

        if (typeof serialized === 'string') {
            try {
                return JSON.parse(serialized);
            } catch (e) {
                return serialized;
            }
        }

        if (typeof serialized === 'object') {
            // Handle object with string values that need parsing
            if (!Array.isArray(serialized)) {
                const result = {};
                for (const [key, value] of Object.entries(serialized)) {
                    if (typeof value === 'string') {
                        try {
                            result[key] = JSON.parse(value);
                        } catch (e) {
                            result[key] = value;
                        }
                    } else {
                        result[key] = this.deserialize(value);
                    }
                }
                return result;
            } else {
                // Handle arrays
                return serialized.map(item => this.deserialize(item));
            }
        }

        // For primitive values
        return serialized;
    }
}
