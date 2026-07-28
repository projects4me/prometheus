import { Factory } from 'ember-cli-mirage';
import _ from 'lodash';

/**
 * Default to full access so acceptance tests can render ACL-gated UI.
 * Scenarios override `entity` per resource action.
 */
export default Factory.extend({
    userId() {
        return (_.random(1, 10)).toString();
    },
    entity() {
        return 'project.get';
    },
    allowed: '1'
});
