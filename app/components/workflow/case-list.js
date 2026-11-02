/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { DEFAULT_PORT } from 'prometheus/utils/workflow/node-config';

/**
 * The cases of a switch: each has a key, which is the output port it takes, and the conditions that pick it. The
 * first case whose conditions hold wins; with none, the switch takes the default port.
 *
 * @class CaseList
 * @namespace Prometheus.Components.Workflow
 * @extends Component
 *
 * @argument {Array} cases the cases in the draft, as [{ key, conditions }]
 * @argument {Array} payloadFields the trigger's payload paths, as [{ path, type }]
 * @argument {Boolean} locked
 * @argument {Function} onChange called with the new list
 */
export default class CaseListComponent extends Component {
    /**
     * The port no case may use as its key
     *
     * @property defaultPort
     * @type String
     * @public
     */
    defaultPort = DEFAULT_PORT;

    /**
     * @property rows
     * @type Array
     * @public
     */
    get rows() {
        let list = Array.isArray(this.args.cases) ? this.args.cases : [];
        return list.map((entry, index) => ({ index, entry }));
    }

    /**
     * Replaces one case's key and reports the new list
     *
     * @method _set
     * @param {Number} index
     * @param {String} key
     * @param {*} value
     * @private
     */
    _set(index, key, value) {
        let list = [...(this.args.cases ?? [])];
        list[index] = { ...list[index], [key]: value };
        this.args.onChange(list);
    }

    /**
     * @method changeKey
     * @param {Number} index
     * @param {Event} event
     * @public
     */
    @action changeKey(index, event) {
        this._set(index, 'key', event.target.value);
    }

    /**
     * @method changeConditions
     * @param {Number} index
     * @param {Array} conditions
     * @public
     */
    @action changeConditions(index, conditions) {
        this._set(index, 'conditions', conditions);
    }

    /**
     * Adds a case with one empty condition
     *
     * @method add
     * @public
     */
    @action add() {
        this.args.onChange([
            ...(this.args.cases ?? []),
            { key: '', conditions: [{ field: '', operator: 'equals', value: '' }] }
        ]);
    }

    /**
     * @method remove
     * @param {Number} index
     * @public
     */
    @action remove(index) {
        this.args.onChange((this.args.cases ?? []).filter((entry, at) => at !== index));
    }
}
