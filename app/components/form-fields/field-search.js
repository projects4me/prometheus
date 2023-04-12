/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { debounce } from '@ember/runloop';
import { action } from '@ember/object';

/**
 * This component renders search box.
 *
 * @class FieldSearch
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FormFieldsFieldSearchComponent extends Component {
    @action onInput(event) {
        this.query = event.target.value;
        debounce(this, this.args.searchFunction, this.query, 200);
    }
}
