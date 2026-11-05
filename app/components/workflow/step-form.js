/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { buildConfig, configFields } from 'prometheus/utils/workflow/node-config';
import { portsOf } from 'prometheus/utils/workflow/node-catalog';
import { fillAgentDefaults, modelChoice } from 'prometheus/utils/workflow/agent-defaults';
import { inject as service } from '@ember/service';

/**
 * The form of one workflow step: its name and the settings of its kind, edited as a draft and applied to the step
 * with Apply. The page is rendered once per step, so switching steps starts a fresh draft.
 *
 * @class StepForm
 * @namespace Prometheus.Components.Workflow
 * @extends Component
 *
 * @argument {GraphNode} node the step
 * @argument {Array} payloadFields the trigger's payload paths, as [{ path, type }]
 * @argument {Array} users the user options, as [{ label, value }]
 * @argument {Array} agents the Agent records
 * @argument {Boolean} locked whether the steps can't be changed
 * @argument {Function} onApply called with (node, name, config)
 * @argument {Function} onRemove called with (node)
 */
export default class StepFormComponent extends Component {
    /**
     * @property intl
     * @type Service
     * @private
     */
    @service intl;

    /**
     * The step's name in the draft
     *
     * @property name
     * @type String
     * @public
     */
    @tracked name = this.args.node?.name ?? '';

    /**
     * The step's settings in the draft: a deep copy, so editing a condition never touches the step until Apply
     *
     * @property config
     * @type Object
     * @public
     */
    @tracked config = JSON.parse(JSON.stringify(this.args.node?.config ?? {}));

    /**
     * The settings the kind takes
     *
     * @property fields
     * @type Array
     * @public
     */
    get fields() {
        return configFields(this.args.node?.category, this.args.node?.kind);
    }

    /**
     * The hints of empty settings; the empty model shows the picked agent's own choice
     *
     * @property placeholders
     * @type Object
     * @public
     */
    get placeholders() {
        let choice = modelChoice(this.agentOf(this.config.agentId));
        return choice ? { model: this.intl.t('views.app.workflow.config.modelDefault', { choice }) } : {};
    }

    /**
     * The output ports the draft gives the step, such as one per switch case
     *
     * @property ports
     * @type Array
     * @public
     */
    get ports() {
        let { category, kind } = this.args.node ?? {};
        return portsOf(category, kind, buildConfig(category, kind, this.config));
    }

    /**
     * @method changeName
     * @param {Event} event
     * @public
     */
    @action changeName(event) {
        this.name = event.target.value;
    }

    /**
     * Sets one setting of the draft
     *
     * @method changeSetting
     * @param {String} name
     * @param {*} value
     * @public
     */
    @action changeSetting(name, value) {
        let config = { ...this.config, [name]: value };
        if (name === 'agentId' && this.args.node?.kind === 'run_agent') {
            config = fillAgentDefaults(config, this.agentOf(this.config.agentId), this.agentOf(value));
        }
        this.config = config;
    }

    /**
     * @method agentOf
     * @param {String} id
     * @return {Agent} the Agent record with the id; nothing for an expression or an unknown id
     * @private
     */
    agentOf(id) {
        return (this.args.agents ?? []).find(agent => String(agent.id) === String(id));
    }

    /**
     * Applies the draft to the step; Save then stores it
     *
     * @method apply
     * @public
     */
    @action apply() {
        let { node } = this.args;
        this.args.onApply(node, this.name.trim(), buildConfig(node.category, node.kind, this.config));
    }
}
