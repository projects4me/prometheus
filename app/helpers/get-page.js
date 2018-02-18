/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This method extracts the page number from the URL in _links property returned
 * via the API
 *
 * @method getPage
 * @param {String} url
 * @return {String} decodedUrl
 */
export function getPage(params) {
    var url = params[0];

    var regex = new RegExp("[?&]page(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * The object that provides the getPage helper function
 *
 * @class GetPage
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(getPage);
