/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { actorPaths, expressionOf } from 'prometheus/utils/workflow/node-config';

/**
 * Picks who a step acts on or through: a user or an agent by name, or an expression that names one when the
 * workflow runs, such as the issue's assignee.
 *
 * @class ActorPicker
 * @namespace Prometheus.Components.Workflow
 * @extends Component
 *
 * @argument {String} type user or agent
 * @argument {String} label
 * @argument {String} info
 * @argument {String} name the setting's name
 * @argument {Boolean} required
 * @argument {String} value the id or expression in the draft
 * @argument {Array} payloadFields the trigger's payload paths, as [{ path, type }]
 * @argument {Array} users the user options, as [{ label, value }]
 * @argument {Array} agents the Agent records
 * @argument {Boolean} locked
 * @argument {Function} onChange called with the picked id or expression
 */
export default class ActorPickerComponent extends Component {
    /**
     * @property intl
     * @type Service
     * @private
     */
    @service intl;

    /**
     * The users or the agents, by name
     *
     * @property recordOptions
     * @type Array
     * @public
     */
    get recordOptions() {
        if (this.args.type === 'agent') {
            return (this.args.agents ?? []).map(agent => ({
                kind: 'agent', label: agent.name, value: String(agent.id), user: agent.user
            }));
        }
        return (this.args.users ?? []).map(user => ({ kind: 'user', label: user.label, value: String(user.value) }));
    }

    /**
     * The payload paths that may hold the id of a user or an agent, as expressions
     *
     * @property expressionOptions
     * @type Array
     * @public
     */
    get expressionOptions() {
        return actorPaths(this.args.payloadFields ?? [])
            .map(path => ({ kind: 'expression', label: path, value: expressionOf(path) }));
    }

    /**
     * The options, grouped: the records first, then the expressions
     *
     * @property options
     * @type Array
     * @public
     */
    get options() {
        let records = this.args.type === 'agent' ? 'agents' : 'users';
        let groups = [{
            groupName: this.intl.t(`views.app.workflow.config.groups.${records}`),
            options: this.recordOptions
        }];
        if (this.expressionOptions.length) {
            groups.push({
                groupName: this.intl.t('views.app.workflow.config.groups.event'),
                options: this.expressionOptions
            });
        }
        return groups;
    }

    /**
     * The selected option; an id or expression no option lists still shows, as itself
     *
     * @property selected
     * @type Object
     * @public
     */
    get selected() {
        let value = this.args.value;
        if (value === undefined || value === null || value === '') {
            return null;
        }
        return [...this.recordOptions, ...this.expressionOptions].find(option => option.value === String(value))
            ?? { kind: 'expression', label: String(value), value: String(value) };
    }

    /**
     * @method pick
     * @param {Object} option
     * @public
     */
    @action pick(option) {
        this.args.onChange(option?.value ?? '');
    }
}
