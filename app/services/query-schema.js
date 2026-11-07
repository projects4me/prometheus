/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import MD from 'prometheus/utils/metadata/metadata';
import { createSchema } from 'prometheus/utils/query/schema';
import { createContext, valueSource } from 'prometheus/utils/query/value-sources';

/**
 * The key a field's values are listed under in the schema: its source and parameters, so fields with
 * the same values (e.g. assignee and owner) share one load.
 *
 * @method sourceKey
 * @private
 */
function sourceKey(values) {
    let { source, ...params } = values;
    let sorted = Object.keys(params)
        .sort()
        .map((name) => [name, params[name]]);

    return sorted.length ? `${source}:${JSON.stringify(sorted)}` : source;
}

/**
 * Loads the ezSearch schema of a module from its search metadata, `views.<Module>.search` in
 * `utils/metadata/metadata.js`, and lists the values of its fields from their value sources
 * (`utils/query/value-sources.js`). Schemas are cached per module and context; the cache holds the
 * promise, so concurrent callers share one load, and a failed load is not kept.
 * Callers check `isDestroying`/`isDestroyed` after awaiting.
 *
 * @class QuerySchemaService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class QuerySchemaService extends Service {
    @service store;
    @service intl;

    /**
     * The loading and loaded schemas by `<module>:<projectId>`.
     *
     * @property cache
     * @type Map
     * @private
     */
    cache = new Map();

    /**
     * Load the schema of a module.
     *
     * @method load
     * @param {String} module The module, e.g. `Issue` or `Project`
     * @param {Object} [options]
     * @param {String|Number} [options.projectId] The project whose values the value sources list
     * @return {Promise<Object|null>} The schema, or null when the module declares no search
     * @public
     */
    load(module, { projectId = null } = {}) {
        let key = `${module}:${projectId ?? ''}`;

        if (!this.cache.has(key)) {
            let promise = this.build(module, projectId);

            this.cache.set(key, promise);
            promise.catch(() => {
                if (this.cache.get(key) === promise) {
                    this.cache.delete(key);
                }
            });
        }

        return this.cache.get(key);
    }

    /**
     * Forget the cached schemas, e.g. after the project's members or milestones changed.
     *
     * @method clear
     * @public
     */
    clear() {
        this.cache.clear();
    }

    /**
     * @method build
     * @private
     */
    async build(module, projectId) {
        let meta = MD.create().getViewMeta(module, 'search');

        if (!meta) {
            return null;
        }

        let fields = Object.entries(meta.fields || {}).map(([id, field]) => ({
            id,
            aliases: field.aliases || [],
            labelKey: field.label,
            label: field.label ? this.intl.t(field.label) : undefined,
            type: field.type,
            valueSource: field.values ? sourceKey(field.values) : undefined,
        }));

        return createSchema({
            module: meta.module || module,
            textField: meta.textField || null,
            fields,
            values: await this.loadValues(Object.values(meta.fields || {}), projectId),
        });
    }

    /**
     * The values of the fields' sources by source key, loaded in parallel, each source once.
     *
     * @method loadValues
     * @private
     */
    async loadValues(fields, projectId) {
        let context = createContext({ owner: this, store: this.store, intl: this.intl, projectId });
        let specs = new Map();

        fields.filter((field) => field.values).forEach((field) => specs.set(sourceKey(field.values), field.values));

        let entries = await Promise.all(
            [...specs].map(async ([key, spec]) => {
                let source = valueSource(spec.source);

                assert(`Unknown search value source "${spec.source}"`, source);

                return [key, source ? await source(spec, context) : []];
            })
        );

        return Object.fromEntries(entries);
    }
}
