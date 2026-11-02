/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { triggerOf, scopeOf } from './list-summary';

/**
 * What the Workflows box of an agent shows: one row per workflow that references the agent, with the places
 * (nodes) it does. Pure functions, so the component stays thin.
 *
 * @module Workflow.AgentReferences
 */

/**
 * The rows of the box, in the order of the workflows given.
 *
 * @method rowsOf
 * @param {Array} workflows the workflow records
 * @param {Array} references the workflowreference records of the agent
 * @param {Array} nodes the workflownode records of the workflows
 * @param {Array} projects the project records, to name a scope
 * @return {Array} `{ workflow, trigger, places: [{ category, kind, name }], projects: [names] }`
 * @public
 */
export function rowsOf(workflows, references, nodes, projects) {
    return workflows.map((workflow) => {
        let own = nodes.filter((node) => String(node.workflowId) === String(workflow.id));
        let placeIds = new Set(references.filter((reference) => String(reference.workflowId) === String(workflow.id)).map((reference) => String(reference.nodeId)));

        return {
            workflow,
            trigger: triggerOf(own),
            places: own.filter((node) => placeIds.has(String(node.id))).map((node) => ({ category: node.category, kind: node.kind, name: node.name })),
            projects: scopeOf(workflow.scope)
                .map((id) => projects.find((project) => String(project.id) === id)?.name)
                .filter(Boolean)
        };
    });
}
