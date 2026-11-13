/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * Renders one cell of the generic module list (app/module) from the field's list metadata.
 * Datetime fields are formatted; every other type shows its raw value.
 *
 * @class FieldView
 * @namespace Prometheus.Components
 * @extends Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class FieldViewComponent extends Component {

    /**
     * Whether the value is a datetime and should be formatted.
     *
     * @property isDatetime
     * @type Boolean
     * @public
     */
    get isDatetime() {
        return this.args.definition?.type === 'datetime';
    }
}
