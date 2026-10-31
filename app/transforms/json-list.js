/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4me/LICENSE.txt. Do not remove this line
 */

import Transform from '@ember-data/serializer/transform';

/**
 * Transform for attributes Gaia stores as JSON text holding a list (e.g. idea message screens and steps).
 * It always yields an array: null, an empty string, invalid JSON or a non-list value give an empty list.
 *
 * @class JsonListTransform
 * @namespace Prometheus.Transforms
 * @extends DS.Transform
 */
export default class JsonListTransform extends Transform {

    /**
     * @param {string|Array|null} serialized - JSON text or an already parsed list
     * @returns {Array}
     */
    deserialize(serialized) {
        if (typeof serialized === 'string' && serialized.trim() === '') {
            return [];
        }
        let parsed = serialized;
        if (typeof serialized === 'string') {
            try {
                parsed = JSON.parse(serialized);
            } catch (e) {
                return [];
            }
        }
        return Array.isArray(parsed) ? parsed : [];
    }

    /**
     * Sends lists as JSON text, as Gaia stores them (it accepts arrays too).
     *
     * @param {Array|null} deserialized
     * @returns {string}
     */
    serialize(deserialized) {
        return JSON.stringify(Array.isArray(deserialized) ? deserialized : []);
    }
}
