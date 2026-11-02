/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const EMPTY_SERVER = { name: '', kind: 'mcp', location: 'ares', endpoint: '', description: '' };
const EMPTY_GRANT = { agentId: '', permissionRule: '' };

/**
 * The controller of the tool catalog. It lists the tool servers, the tools of the selected server and the grants
 * of the selected server or tool to agents. Grants are made here and shown on the agent page.
 *
 * @class AppAgentToolsController
 * @namespace Prometheus.Controllers
 * @module App.Agent
 * @extends Controller
 */
export default class AppAgentToolsController extends Controller {
    @service store;

    @tracked servers = [];
    @tracked tools = [];
    @tracked grants = [];
    @tracked agents = [];

    /** The id of the selected tool server. */
    @tracked selectedServerId = null;

    /** The id of the selected tool, whose grants are shown instead of the server's. */
    @tracked selectedToolId = null;

    /** The id of the server being refreshed. */
    @tracked refreshingId = null;

    /** Whether the add server form is open. */
    @tracked showServerForm = false;

    @tracked serverForm = { ...EMPTY_SERVER };
    @tracked grantForm = { ...EMPTY_GRANT };

    /** What failed last: `name`, `agent`, `save` or `refresh`. */
    @tracked error = null;

    /**
     * Takes the catalog the route loaded.
     *
     * @method load
     * @param {Object} model the servers, tools, grants and agents
     */
    load(model) {
        this.servers = model.servers.toArray();
        this.tools = model.tools.toArray();
        this.grants = model.grants.toArray();
        this.agents = model.agents.toArray();
        this.selectedServerId = null;
        this.selectedToolId = null;
        this.showServerForm = false;
        this.error = null;
        this.serverForm = { ...EMPTY_SERVER };
        this.grantForm = { ...EMPTY_GRANT };
    }

    /**
     * The tool servers with the counts the table shows.
     *
     * @property serverRows
     * @type Array
     */
    get serverRows() {
        return this.servers.map((server) => {
            let tools = this.tools.filter((tool) => tool.toolServerId === server.id);
            let toolIds = tools.map((tool) => tool.id);
            let agentIds = new Set(
                this.grants
                    .filter((grant) => grant.toolServerId === server.id || toolIds.includes(grant.toolId))
                    .map((grant) => grant.agentId)
            );

            return {
                server,
                toolCount: tools.length,
                agentCount: agentIds.size,
                isSelected: server.id === this.selectedServerId,
                canRefresh: server.kind !== 'builtin',
                isRefreshing: server.id === this.refreshingId
            };
        });
    }

    /**
     * @property selectedServer
     * @type Prometheus.Model.Toolserver
     */
    get selectedServer() {
        return this.servers.find((server) => server.id === this.selectedServerId);
    }

    /**
     * The tools of the selected server with the agents each is granted to, directly or through its server.
     *
     * @property toolRows
     * @type Array
     */
    get toolRows() {
        return this.tools
            .filter((tool) => tool.toolServerId === this.selectedServerId)
            .map((tool) => ({
                tool,
                inputs: this.inputNames(tool),
                grantedTo: this.agentNames(
                    this.grants.filter((grant) => grant.toolId === tool.id || grant.toolServerId === tool.toolServerId)
                ),
                isSelected: tool.id === this.selectedToolId
            }));
    }

    /**
     * @property selectedTool
     * @type Prometheus.Model.Tool
     */
    get selectedTool() {
        return this.tools.find((tool) => tool.id === this.selectedToolId);
    }

    /**
     * The grants of the selected tool, or of the selected server when no tool is selected.
     *
     * @property grantRows
     * @type Array
     */
    get grantRows() {
        let grants = this.selectedTool
            ? this.grants.filter((grant) => grant.toolId === this.selectedToolId)
            : this.grants.filter((grant) => grant.toolServerId === this.selectedServerId);

        return grants.map((grant) => ({ grant, agentName: this.agentName(grant.agentId) }));
    }

    /**
     * @method agentName
     * @param {String} agentId the id of an agent
     * @return {String}
     */
    agentName(agentId) {
        return this.agents.find((agent) => agent.id === agentId)?.name ?? agentId;
    }

    /**
     * @method agentNames
     * @param {Array} grants grants to agents
     * @return {String} the agents' names without duplicates, comma separated
     */
    agentNames(grants) {
        return [...new Set(grants.map((grant) => this.agentName(grant.agentId)))].join(', ');
    }

    /**
     * The argument names of a tool from the JSON schema of its input.
     *
     * @method inputNames
     * @param {Prometheus.Model.Tool} tool the tool
     * @return {Array}
     */
    inputNames(tool) {
        try {
            return Object.keys(JSON.parse(tool.inputSchema)?.properties ?? {});
        } catch (e) {
            return [];
        }
    }

    @action selectServer(server, event) {
        event?.preventDefault();
        this.selectedServerId = server.id;
        this.selectedToolId = null;
        this.grantForm = { ...EMPTY_GRANT };
    }

    @action selectTool(tool, event) {
        event?.preventDefault();
        this.selectedToolId = tool.id === this.selectedToolId ? null : tool.id;
        this.grantForm = { ...EMPTY_GRANT };
    }

    @action toggleServerForm() {
        this.showServerForm = !this.showServerForm;
    }

    /**
     * The options of the kind and location selects and the agents, as `{ label, value }`.
     *
     * @property serverKindOptions
     * @type Array
     */
    serverKindOptions = ['mcp', 'openapi', 'builtin'].map((value) => ({ label: value, value }));

    /**
     * @property serverLocationOptions
     * @type Array
     */
    serverLocationOptions = ['runtime', 'ares', 'external'].map((value) => ({ label: value, value }));

    /**
     * @property agentOptions
     * @type Array
     */
    get agentOptions() {
        return this.agents.map((agent) => ({ label: agent.name, value: agent.id }));
    }

    /**
     * Sets a field of the add server form or of the grant form from a chosen option.
     *
     * @method selectOption
     * @param {String} form `serverForm` or `grantForm`
     * @param {String} field the field
     * @param {Object} option the chosen option
     */
    @action selectOption(form, field, option) {
        this[form] = { ...this[form], [field]: option.value };
    }

    @action async addServer(event) {
        event?.preventDefault();
        this.error = null;
        if (!this.serverForm.name.trim()) {
            this.error = 'name';
            return;
        }
        let { endpoint } = this.serverForm;
        let server = this.store.createRecord('toolserver', { ...this.serverForm, endpoint: endpoint.trim() || null });
        try {
            await server.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.servers = [...this.servers, server].sort((a, b) => a.name.localeCompare(b.name));
            this.selectedServerId = server.id;
            this.showServerForm = false;
            this.serverForm = { ...EMPTY_SERVER };
        } catch (e) {
            server.unloadRecord();
            this.error = 'save';
        }
    }

    /**
     * Reloads the tools of a server with MCP tools/list, then the tools of the catalog.
     *
     * @method refreshServer
     * @param {Prometheus.Model.Toolserver} server the server
     */
    @action async refreshServer(server) {
        this.error = null;
        this.refreshingId = server.id;
        try {
            server.set('refresh', true);
            await server.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            let tools = await this.store.query('tool', { limit: -1, sort: 'Tool.name', order: 'asc' });
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.tools = tools.toArray();
        } catch (e) {
            this.error = 'refresh';
        } finally {
            server.set('refresh', false);
            this.refreshingId = null;
        }
    }

    /**
     * Grants the selected tool, or the selected server, to the agent of the grant form.
     *
     * @method addGrant
     * @param {Event} event the submit event
     */
    @action async addGrant(event) {
        event?.preventDefault();
        this.error = null;
        let { agentId, permissionRule } = this.grantForm;
        if (!agentId) {
            this.error = 'agent';
            return;
        }
        let grant = this.store.createRecord('agenttool', {
            agentId,
            permissionRule: permissionRule.trim() || null,
            toolId: this.selectedToolId,
            toolServerId: this.selectedToolId ? null : this.selectedServerId
        });
        try {
            await grant.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.grants = [...this.grants, grant];
            this.grantForm = { ...EMPTY_GRANT };
        } catch (e) {
            grant.unloadRecord();
            this.error = 'save';
        }
    }

    /**
     * Saves the permission rule of a grant when its field changes.
     *
     * @method saveRule
     * @param {Prometheus.Model.Agenttool} grant the grant
     * @param {Event} event the change event
     */
    @action async saveRule(grant, event) {
        this.error = null;
        grant.set('permissionRule', event.target.value.trim() || null);
        try {
            await grant.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
        } catch (e) {
            grant.rollbackAttributes();
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
