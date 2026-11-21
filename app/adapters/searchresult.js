/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationAdapter from './application';

/**
 * Search results are served by Gaia's `search` resource, not by a resource named after the model.
 *
 * @class SearchresultAdapter
 * @namespace Prometheus.Adapter
 * @extends ApplicationAdapter
 */
export default class SearchresultAdapter extends ApplicationAdapter {

    /**
     * @method pathForType
     * @return {String} search
     */
    pathForType() {
        return 'search';
    }
}
