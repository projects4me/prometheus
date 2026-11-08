/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
    BASE_QUERY,
    QUERY_PRESETS,
    SAVED_SEARCHES,
    fixtureSchema,
} from 'prometheus/utils/developer/ez-search-fixture';

/**
 * The Component Library demo of ezSearch: the full bar, and EzSearchCompact multi-row and linear, over a
 * fixture schema and fixture saved searches. Nothing calls Gaia; saving only logs.
 *
 * @class DeveloperDemosEzSearch
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperDemosEzSearchComponent extends Component {
    variants = [
        { key: 'full', label: 'EzSearch' },
        { key: 'multi', label: 'EzSearchCompact multi-row' },
        { key: 'linear', label: 'EzSearchCompact linear' },
    ];

    presets = Object.keys(QUERY_PRESETS);

    schema = fixtureSchema();

    savedSearches = SAVED_SEARCHES;

    @tracked variant = 'full';
    @tracked preset = 'empty';
    @tracked useBase = false;
    @tracked activeId = '';
    // A new key remounts the component, which Reset uses to drop the typed state.
    @tracked mountKey = 0;

    get query() {
        return QUERY_PRESETS[this.preset];
    }

    get baseQuery() {
        return this.useBase ? BASE_QUERY : undefined;
    }

    get activeOptions() {
        return ['none', ...this.savedSearches.map((search) => search.id)];
    }

    get activeKey() {
        return this.activeId || 'none';
    }

    get isFull() {
        return this.variant === 'full';
    }

    get isLinear() {
        return this.variant === 'linear';
    }

    @action
    setVariant(key) {
        this.variant = key;
        this.mountKey++;
    }

    @action
    setPreset(preset) {
        this.preset = preset;
    }

    @action
    toggleBase(event) {
        this.useBase = event.target.checked;
    }

    @action
    setActive(key) {
        this.activeId = key === 'none' ? '' : key;
    }

    @action
    reset() {
        this.preset = 'empty';
        this.useBase = false;
        this.activeId = '';
        this.mountKey++;
    }

    @action
    onApply(log, query) {
        log.log('onApply', query);
    }

    @action
    onSave(log, query) {
        log.log('onSave', query);
    }

    @action
    onSavedSearchChange(log, search) {
        log.log('onSavedSearchChange', search);
    }

    @action
    onUpdateSavedSearch(log, search, query) {
        log.log('onUpdateSavedSearch', search, query);
    }
}
