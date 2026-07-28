import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import _ from 'lodash';

/**
 * Role permission rows for the role page (one row per module.action).
 */
export default Factory.extend({
    resourceName() {
        return 'issue.get';
    },
    dateCreated() {
        return date.createdDate(10, 30);
    },
    dateModified() {
        return date.modifiedDate(5, 7);
    },
    allowed: '1',
    roleId() {
        return (_.random(1, 10)).toString();
    }
});
