/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
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
    @service currentUser;

    /**
     * The loading and loaded schemas by `<module>:<projectId>:<current user id>`.
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
        let currentUserId = this.currentUser.user?.id ?? null;
        let key = `${module}:${projectId ?? ''}:${currentUserId ?? ''}`;

        if (!this.cache.has(key)) {
            let promise = this.build(module, projectId, currentUserId);

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
    async build(module, projectId, currentUserId) {
        let meta = this.searchMeta(module);

        if (!meta) {
            return null;
        }

        let excluded = (meta.excluded || []).map(([id, field]) => ({
            id,
            aliases: field.aliases || [],
            labelKey: field.label,
            label: field.label ? this.intl.t(field.label) : undefined,
            reason: meta.excludeReason ? this.intl.t(meta.excludeReason) : undefined,
        }));

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
            excluded,
            values: await this.loadValues(Object.values(meta.fields || {}), projectId, currentUserId),
        });
    }

    /**
     * The search metadata of a view, with `extends` and `exclude` applied: a view that `extends` another
     * module starts from that module's search metadata (module, text field, fields), and `exclude` removes
     * field ids from it. The removed fields come back as `excluded` entries, `[id, field]`, so the parser
     * can refuse them with a clear message; `excludeReason` is the translation key of the hint.
     * Unknown `extends` or `exclude` ids are errors in development and tests.
     *
     * @method searchMeta
     * @param {String} view The view, e.g. `Issue` or `TaskBoard`
     * @return {Object|false} The metadata, or false when the view declares no search
     * @private
     */
    searchMeta(view) {
        let md = MD.create();
        let meta = md.getViewMeta(view, 'search');

        if (!meta || !meta.extends) {
            return meta;
        }

        let base = md.getViewMeta(meta.extends, 'search');

        assert(`View "${view}" extends "${meta.extends}", which declares no search metadata`, base);

        let fields = { ...((base && base.fields) || {}) };
        let excluded = [];

        (meta.exclude || []).forEach((id) => {
            assert(`View "${view}" excludes "${id}", which is not a search field of "${meta.extends}"`, id in fields);

            if (id in fields) {
                excluded.push([id, fields[id]]);
                delete fields[id];
            }
        });

        return {
            ...base,
            ...meta,
            module: meta.module || (base && base.module) || meta.extends,
            textField: meta.textField || (base && base.textField) || null,
            fields: { ...fields, ...(meta.fields || {}) },
            excluded,
        };
    }

    /**
     * The values of the fields' sources by source key, loaded in parallel, each source once.
     *
     * @method loadValues
     * @private
     */
    async loadValues(fields, projectId, currentUserId) {
        let context = createContext({ owner: this, store: this.store, intl: this.intl, projectId, currentUserId });
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
