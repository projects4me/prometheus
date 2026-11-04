/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * The form of a test run: the record to run the workflow against. It only collects the id; the editor runs it.
 *
 * @class WorkflowTestRunBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class WorkflowTestRunBoxComponent extends Component {
    /**
     * @property entityId
     * @type String
     * @public
     */
    @tracked entityId = '';

    /**
     * Whether the record is picked from the scope's milestones rather than typed as an id
     *
     * @property isMilestone
     * @type Boolean
     * @public
     */
    get isMilestone() {
        return this.args.entityType === 'Milestone';
    }

    /**
     * The picked milestone option
     *
     * @property selectedMilestone
     * @type Object
     * @public
     */
    get selectedMilestone() {
        return (this.args.milestones ?? []).find(option => option.value === this.entityId) ?? null;
    }

    /**
     * @method pickMilestone
     * @param {Object} option
     * @public
     */
    @action pickMilestone(option) {
        this.entityId = option?.value ?? '';
    }

    /**
     * @property cannotRun
     * @type Boolean
     * @public
     */
    get cannotRun() {
        return this.args.running || !String(this.entityId ?? '').trim();
    }

    /**
     * @method run
     * @public
     */
    @action run() {
        if (!this.cannotRun) {
            this.args.onRun(String(this.entityId).trim());
        }
    }
}
