import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import _ from 'lodash';

/**
 * Role permission rows for the role page. Default all flags to allow (1).
 */
export default Factory.extend({
    resourceName() {
        return 'Issue';
    },
    dateCreated() {
        return date.createdDate(10, 30);
    },
    dateModified() {
        return date.modifiedDate(5, 7);
    },
    readF: '1',
    createF: '1',
    updateF: '1',
    deleteF: '1',
    importF: '1',
    exportF: '1',
    roleId() {
        return (_.random(1, 10)).toString();
    }
});
