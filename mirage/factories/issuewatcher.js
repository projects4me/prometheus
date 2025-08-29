/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(10, 30);
    },
    dateModified() {
        return date.modifiedDate(5, 7);
    },
    deleted: '0',
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    createdUserName() {
        return `User ${this.createdUser}`;
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUserName() {
        return `User ${this.modifiedUser}`;
    },
    isWatching: '0',
    issueId() {
        return (_.random(1, 10)).toString();
    },
    userId() {
        return (_.random(1, 10)).toString();
    }
});
