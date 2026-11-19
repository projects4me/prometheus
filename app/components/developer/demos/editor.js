/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEditorEmpty } from 'prometheus/utils/ui/editor-empty';

const USERS = [
    { value: 'u1', label: 'Ada Lovelace' },
    { value: 'u2', label: 'Grace Hopper' },
    { value: 'u3', label: 'Alan Turing' }
];

const ISSUES = [
    { id: 'i1', subject: 'Login fails on Safari', issueNumber: 101, status: 'inprogress', projectShortcode: 'aprom', priority: 'high' },
    { id: 'i2', subject: 'Slow issue list', issueNumber: 102, status: 'new', projectShortcode: 'aprom', priority: 'low' }
];

const VARIANTS = ['bare', 'form field', 'mentions', 'markdown', 'read-only', 'disabled'];

/**
 * The AppUi::Editor demo of the Component Library: bare, form field, mentions and #issue links, markdown output,
 * read-only viewer and disabled. It logs the editor's callbacks to the entry's event log.
 *
 * @class DeveloperDemosEditorComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosEditorComponent extends Component {
    variants = VARIANTS;

    users = USERS;

    @tracked variant = 'bare';

    @tracked value = '<p>Hello <strong>world</strong></p>';

    @tracked message = '';

    /**
     * Keeps the value and logs it.
     *
     * @method change
     * @param {Object} log the entry's event log
     * @param {String} value
     */
    @action
    change(log, value) {
        this.value = value;
        this.message = '';
        log.log('onChange', value);
    }

    /**
     * Logs a blur
     *
     * @method blur
     * @param {Object} log
     */
    @action
    blur(log) {
        log.log('onBlur', '');
    }

    /**
     * Logs a submit
     *
     * @method submit
     * @param {Object} log
     * @param {String} value
     */
    @action
    submit(log, value) {
        log.log('onSubmit', value);
    }

    /**
     * Required validation of the form field variant
     *
     * @method validate
     * @param {Object} log
     * @param {String} value
     */
    @action
    validate(log, value) {
        this.message = isEditorEmpty(value) ? 'This field is required' : '';
        log.log('validate', this.message || 'valid');
    }

    /**
     * Searches the fixture issues
     *
     * @method issueSearch
     * @param {String} text
     * @returns {Promise}
     */
    @action
    issueSearch(text) {
        return Promise.resolve(ISSUES.filter((issue) => String(issue.issueNumber).includes(text) || issue.subject.toLowerCase().includes(String(text).toLowerCase())));
    }

    /**
     * Shows another variant
     *
     * @method setVariant
     * @param {String} variant
     */
    @action
    setVariant(variant) {
        this.variant = variant;
        this.value = variant === 'markdown' ? '**Hello** world' : '<p>Hello <strong>world</strong></p>';
        this.message = '';
    }

    /**
     * Back to the first variant
     *
     * @method reset
     */
    @action
    reset() {
        this.setVariant('bare');
    }
}
