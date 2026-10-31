/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The node kinds a workflow can use, by category, with the output ports each kind offers. It mirrors Gaia's
 * NodeKindCatalog and TriggerEventCatalog so the editor can offer the kinds and draw their ports; Gaia still
 * validates every node and edge on save.
 *
 * @class NodeCatalog
 * @namespace Prometheus.Utils.Workflow
 */

/**
 * The drag type a palette item carries to the canvas
 *
 * @property NODE_DRAG_TYPE
 * @type String
 * @public
 */
export const NODE_DRAG_TYPE = 'application/x-p4m-workflow-node';

/**
 * The categories in palette order
 *
 * @property CATEGORIES
 * @type Array
 * @public
 */
export const CATEGORIES = ['trigger', 'condition', 'actor', 'action'];

/**
 * The Font Awesome icon of each category
 *
 * @property CATEGORY_ICONS
 * @type Object
 * @public
 */
export const CATEGORY_ICONS = {
    trigger: 'bolt',
    condition: 'code-fork',
    actor: 'user',
    action: 'cog'
};

const NEXT = ['next'];

/**
 * The fixed output ports of each kind, by category. A switch adds one port per case of its config.
 *
 * @property KINDS
 * @type Object
 * @private
 */
const KINDS = {
    trigger: {
        'issue.created': NEXT,
        'issue.modified': NEXT,
        'issue.assignee.changed': NEXT,
        'issue.status.changed': NEXT,
        'comment.added': NEXT,
        'wiki.created': NEXT,
        'wiki.modified': NEXT,
        'time.logged': NEXT,
        'schedule': NEXT
    },
    condition: {
        filter: ['pass', 'fail'],
        switch: ['default']
    },
    actor: {
        run_agent: ['done', 'needs_input', 'blocked', 'failed', 'limit'],
        ask_user: ['replied', 'reassigned']
    },
    action: {
        assign: NEXT,
        set_field: NEXT,
        set_status: NEXT,
        add_comment: NEXT,
        create_issue: NEXT,
        create_wiki: NEXT,
        notify: NEXT,
        call_tool: NEXT,
        end: []
    }
};

/**
 * The kinds of a category, in catalog order
 *
 * @method kindsOf
 * @param {String} category
 * @return {Array}
 * @public
 */
export function kindsOf(category) {
    return Object.keys(KINDS[category] ?? {});
}

/**
 * Whether the kind belongs to the category
 *
 * @method hasKind
 * @param {String} category
 * @param {String} kind
 * @return {Boolean}
 * @public
 */
export function hasKind(category, kind) {
    return Boolean(KINDS[category]?.[kind]);
}

/**
 * The output ports of a node of this kind with this config: the switch cases first, then the fixed ports
 *
 * @method portsOf
 * @param {String} category
 * @param {String} kind
 * @param {Object} config
 * @return {Array}
 * @public
 */
export function portsOf(category, kind, config = {}) {
    let cases = Array.isArray(config?.cases) ? config.cases : [];
    let caseKeys = cases.map(entry => entry?.key).filter(key => typeof key === 'string' && key !== '');
    return [...new Set([...caseKeys, ...(KINDS[category]?.[kind] ?? [])])];
}

/**
 * Whether nodes of the category take incoming edges; triggers start a workflow, so they don't
 *
 * @method hasInput
 * @param {String} category
 * @return {Boolean}
 * @public
 */
export function hasInput(category) {
    return category !== 'trigger';
}

/**
 * The translation key of a kind's label; kinds such as issue.created contain dots, which the key can't
 *
 * @method kindLabelKey
 * @param {String} kind
 * @return {String}
 * @public
 */
export function kindLabelKey(kind) {
    return `views.app.workflow.kinds.${String(kind).replace(/\./g, '_')}`;
}
