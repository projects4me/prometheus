import { Factory } from 'ember-cli-mirage';
import _ from 'lodash';

/**
 * Default to full access (1) so acceptance tests can render ACL-gated UI.
 * Scenarios override `entity` per resource.
 */
export default Factory.extend({
    userId() {
        return (_.random(1, 10)).toString();
    },
    entity() {
        return 'Project';
    },
    readF: '1',
    createF: '1',
    updateF: '1',
    deleteF: '1',
    importF: '1',
    exportF: '1'
});
