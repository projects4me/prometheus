/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const EMPTY_SKILL = { name: '', version: '', description: '', content: '' };

/**
 * The controller of the skills screen: the list of skills and the editor of the selected one, with the agents it
 * is granted to.
 *
 * @class AppAgentSkillsController
 * @namespace Prometheus.Controllers
 * @module App.Agent
 * @extends Controller
 */
export default class AppAgentSkillsController extends Controller {
    @service store;

    @tracked skills = [];
    @tracked grants = [];
    @tracked agents = [];

    /** The id of the selected skill, null for a new one. */
    @tracked selectedSkillId = null;

    /** The values in the editor. */
    @tracked draft = { ...EMPTY_SKILL };

    /** What failed last: `name` or `save`. */
    @tracked error = null;

    /** The agent chosen to be granted the skill. */
    @tracked grantAgentId = '';

    /**
     * @method load
     * @param {Object} model the skills, grants and agents
     */
    load(model) {
        this.skills = model.skills.slice();
        this.grants = model.grants.slice();
        this.agents = model.agents.slice();
        this.startDraft(null);
    }

    /**
     * Fills the editor with a skill, or empties it for a new skill.
     *
     * @method startDraft
     * @param {Prometheus.Model.Skill|null} skill the skill
     */
    startDraft(skill) {
        this.selectedSkillId = skill?.id ?? null;
        this.draft = skill
            ? { name: skill.name, version: skill.version, description: skill.description, content: skill.content }
            : { ...EMPTY_SKILL };
        this.error = null;
        this.grantAgentId = '';
    }

    /**
     * The skills with the number of agents each is granted to.
     *
     * @property skillRows
     * @type Array
     */
    get skillRows() {
        return this.skills.map((skill) => ({
            skill,
            agentCount: this.grants.filter((grant) => grant.skillId === skill.id).length,
            isSelected: skill.id === this.selectedSkillId
        }));
    }

    /**
     * @property selectedSkill
     * @type Prometheus.Model.Skill
     */
    get selectedSkill() {
        return this.skills.find((skill) => skill.id === this.selectedSkillId);
    }

    /**
     * The grants of the selected skill with their agents.
     *
     * @property grantRows
     * @type Array
     */
    get grantRows() {
        return this.grants
            .filter((grant) => grant.skillId === this.selectedSkillId)
            .map((grant) => ({
                grant,
                agentName: this.agents.find((agent) => agent.id === grant.agentId)?.name ?? grant.agentId
            }));
    }

    /**
     * The agents the selected skill is not yet granted to.
     *
     * @property grantableAgents
     * @type Array
     */
    get grantableAgents() {
        let granted = this.grantRows.map((row) => row.grant.agentId);

        return this.agents
            .filter((agent) => !granted.includes(agent.id))
            .map((agent) => ({ label: agent.name, value: agent.id }));
    }

    @action newSkill() {
        this.startDraft(null);
    }

    @action selectSkill(skill, event) {
        event?.preventDefault();
        this.startDraft(skill);
    }

    /**
     * @method selectGrantAgent
     * @param {Object} option the chosen agent as `{ label, value }`
     */
    @action selectGrantAgent(option) {
        this.grantAgentId = option.value;
    }

    @action async save(event) {
        event?.preventDefault();
        this.error = null;
        if (!this.draft.name.trim()) {
            this.error = 'name';
            return;
        }
        let skill = this.selectedSkill ?? this.store.createRecord('skill');
        let isNew = skill.isNew;
        skill.setProperties({ ...this.draft, name: this.draft.name.trim() });
        try {
            await skill.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            if (isNew) {
                this.skills = [...this.skills, skill].sort((a, b) => a.name.localeCompare(b.name));
            }
            this.selectedSkillId = skill.id;
        } catch (e) {
            if (isNew) {
                skill.unloadRecord();
            } else {
                skill.rollbackAttributes();
            }
            this.error = 'save';
        }
    }

    @action cancel() {
        this.startDraft(this.selectedSkill ?? null);
    }

    @action async addGrant() {
        this.error = null;
        if (!this.grantAgentId || !this.selectedSkillId) {
            return;
        }
        let grant = this.store.createRecord('agentskill', { agentId: this.grantAgentId, skillId: this.selectedSkillId });
        try {
            await grant.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.grants = [...this.grants, grant];
            this.grantAgentId = '';
        } catch (e) {
            grant.unloadRecord();
            this.error = 'save';
        }
    }

    @action async removeGrant(grant, event) {
        event?.preventDefault();
        this.error = null;
        try {
            await grant.destroyRecord();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.grants = this.grants.filter((item) => item !== grant);
        } catch (e) {
            grant.rollbackAttributes();
            this.error = 'save';
        }
    }
}
