/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import splitMarkdown from 'prometheus/utils/split-markdown';

/**
 * Loads the component documentation files in public/ui-docs. They are static assets of the app itself, not
 * Gaia resources, so the store and adapter rule does not apply and fetch is used directly.
 *
 * @class UiDocsService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class UiDocsService extends Service {
    /**
     * Fetches a documentation file and splits it into sections. A dev server answers an unknown path with
     * its index page (status 200, text/html), which is treated as a missing file as well as a 404.
     *
     * @method load
     * @param {String} doc file name inside public/ui-docs
     * @return {Promise<Object>} { missing: Boolean, sections: Array }
     * @throws {Error} on any other failing status or a network error
     */
    async load(doc) {
        let response = await fetch(`/ui-docs/${doc}`);
        let isPage = (response.headers?.get('content-type') ?? '').includes('text/html');
        if (response.status === 404 || (response.ok && isPage)) {
            return { missing: true, sections: [] };
        }
        if (!response.ok) {
            throw new Error(`status ${response.status}`);
        }
        return { missing: false, sections: splitMarkdown(await response.text()) };
    }
}
