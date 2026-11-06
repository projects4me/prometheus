/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { createSchema } from 'prometheus/utils/query/schema';

/**
 * The fields of the Project module, with the ids of the project list's filters.
 *
 * @property PROJECT_FIELDS
 * @type Array
 * @private
 */
const PROJECT_FIELDS = [
    { id: 'Project.name', aliases: ['name'], labelKey: 'views.app.project.filter.name', type: 'text' },
    { id: 'Project.shortCode', aliases: ['code'], labelKey: 'views.app.project.filter.shortCode', type: 'text' },
    { id: 'Project.status', aliases: ['status'], labelKey: 'views.app.project.filter.status', type: 'enum', valueSource: 'statuses' },
    { id: 'manager.name', aliases: ['manager'], labelKey: 'views.app.project.filter.manager', type: 'text' },
];

/**
 * Create the schema of the Project module.
 *
 * @method createProjectSchema
 * @param {Object} options
 * @param {Ember.Service} options.intl The intl service, for the labels
 * @param {Object} [options.values] The values of the `statuses` source
 * @return {Object} The schema
 */
export function createProjectSchema({ intl, values = {} }) {
    return createSchema({
        module: 'Project',
        textField: 'Project.name',
        fields: PROJECT_FIELDS.map((field) => ({ ...field, label: intl.t(field.labelKey) })),
        values,
    });
}
