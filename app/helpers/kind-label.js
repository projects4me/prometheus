/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { kindLabelKey } from 'prometheus/utils/workflow/node-catalog';

/**
 * The translation key of a workflow node kind's label
 *
 * @class KindLabel
 * @namespace Prometheus.Helpers
 */
export default helper(function kindLabel([kind]) {
    return kindLabelKey(kind);
});
