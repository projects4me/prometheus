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

    /**
     * This function is triggered which user enters some input.
     * 
     * @method onInput
     * @param {KeyboardEvent} event 
     */
    @action onInput(event) {
        this.query = event.target.value;
        debounce(this, this.searchFunction, this.query, 200);
    }

    /**
     * A getter property that retrieves the search function passed as an argument,
     * or returns a default search function that always returns true if not provided.
     * 
     * @property {Function} searchFunction
     * @type {Function}
     * @returns {Function}
     */
    get searchFunction() {
        return this.args.searchFunction ?? (() => true);
    }
}
