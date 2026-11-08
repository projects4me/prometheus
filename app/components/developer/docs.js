/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Logger from 'js-logger';
import { inject as service } from '@ember/service';

/**
 * Shows the documentation of a component: the markdown file public/ui-docs/<@doc>, split on its "## "
 * headings into tabs. The files are static assets served with the app and fetched only when an entry is
 * opened, so they do not grow the bundle.
 *
 * <Developer::Docs @doc="app-ui-loader.md" />
 *
 * @class DeveloperDocsComponent
 * @namespace Prometheus.Components.Developer
 * @extends Glimmer.Component
 */
export default class DeveloperDocsComponent extends Component {
    @service uiDocs;

    /**
     * Whether the file is being fetched
     *
     * @property loading
     * @type Boolean
     */
    @tracked loading = true;

    /**
     * Whether the file does not exist
     *
     * @property missing
     * @type Boolean
     */
    @tracked missing = false;

    /**
     * Whether the file could not be fetched
     *
     * @property failed
     * @type Boolean
     */
    @tracked failed = false;

    /**
     * The sections of the file, each with a title and a markdown body
     *
     * @property sections
     * @type Array
     */
    @tracked sections = [];

    /**
     * The section of the open tab
     *
     * @property active
     * @type Object
     */
    @tracked active = null;

    constructor() {
        super(...arguments);
        this.load();
    }

    /**
     * The address of the file in the public folder
     *
     * @property path
     * @type String
     */
    get path() {
        return `/ui-docs/${this.args.doc}`;
    }

    /**
     * Loads the file through the ui-docs service. The state is set only if the component is still alive.
     * `@doc` is read once, when the component is created.
     *
     * @method load
     * @private
     */
    async load() {
        try {
            let { missing, sections } = await this.uiDocs.load(this.args.doc);
            this.finish({ missing, sections, active: sections[0] ?? null });
        } catch (e) {
            Logger.error('DeveloperDocs->load ' + e);
            this.finish({ failed: true });
        }
    }

    /**
     * Sets the state once, unless the component is gone
     *
     * @method finish
     * @param {Object} state
     * @private
     */
    finish(state) {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.missing = !!state.missing;
        this.failed = !!state.failed;
        this.sections = state.sections ?? [];
        this.active = state.active ?? null;
        this.loading = false;
    }

    /**
     * Opens the tab of a section
     *
     * @method select
     * @param {Object} section
     * @param {Event} event
     */
    @action
    select(section, event) {
        event?.preventDefault();
        this.active = section;
    }
}
