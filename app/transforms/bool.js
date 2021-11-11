/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Transform from '@ember-data/serializer/transform';
import { isNone } from '@ember/utils';

/**
 * This is the bool transform, we are using this as in
 * Phalcon we only accepts 0 or 1 for true or false but
 * in Ember they are represented as true or false
 *
 * @class Bool
 * @namespace Prometheus.Transforms
 * @extends DS.Transform
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Transform.extend({

    /**
     * This function receives a 0 or 1 from the JSON object
     * and converts it to true or false respectively
     *
     * @param serialized
     * @return {boolean}
     */
    deserialize(serialized) {
        if (isNone(serialized)) {
            return false;
        }

        return Boolean(serialized);
    },

    /**
     * When given a deserialized value from a record this function
     * is used to covert it from true or false to 1 or 0
     * respectively
     *
     * @param deserialized
     * @return {string}
     */
    serialize(deserialized) {
        let val = false;

        if (isNone(deserialized)) {
            return '0';
        }

        let type = typeof deserialized;
        if (type === "boolean") {
            val = deserialized;
        } else if (type === "string") {
            val = /^(true|t|1)$/i.test(deserialized);
        } else if (type === "number") {
            val = (deserialized === 1);
        } else {
            val = false;
        }

        return (val)?'1':'0';
    }

});