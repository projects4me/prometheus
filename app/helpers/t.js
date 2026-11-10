/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

/**
 * `{{t "key" name=value}}`. Recomputes when the locale or translations change
 * (the intl service's state is tracked).
 *
 * @class THelper
 * @namespace Prometheus.Helpers
 */
export default class THelper extends Helper {
    @service intl;

    compute([key, positionalOptions], namedOptions) {
        const options = positionalOptions ? Object.assign({}, positionalOptions, namedOptions) : namedOptions;

        if (isEmpty(key)) {
            if (options?.allowEmpty) {
                return '';
            }
            if (typeof key === 'undefined') {
                throw new Error('{{t}} helper requires a value.');
            }
        }

        // consume the tracked locale so a locale switch recomputes
        this.intl.locale;
        return this.intl.t(key, options);
    }
}
