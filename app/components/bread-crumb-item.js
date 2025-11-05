/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * Individual breadcrumb item component
 * 
 * @class BreadCrumbItemComponent
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class BreadCrumbItemComponent extends Component {
    /**
     * Whether this item should be clickable
     * 
     * @property isClickable
     * @type Boolean
     * @public
     */
    get isClickable() {
        return this.args.item.linkable && 
               !this.args.isLast && 
               (this.args.linkable !== false);
    }

    /**
     * Get the model(s) for LinkTo component
     * Returns null if no params, single value if one param, or array if multiple params
     * 
     * @property linkToModel
     * @type {String|Array|null}
     * @public
     */
    get linkToModel() {
        const { params } = this.args.item;
        
        if (!params || params.length === 0) {
            return null;
        }
        
        // If single param, return as single value
        if (params.length === 1) {
            return params[0];
        }
        
        // Multiple params - return as array for @models
        return params;
    }

    /**
     * Determine if LinkTo should use @models (array) or @model (single)
     * 
     * @property useModels
     * @type Boolean
     * @public
     */
    get useModels() {
        const { params } = this.args.item;
        // Use @models when we have multiple params
        return params && params.length > 1;
    }
}

