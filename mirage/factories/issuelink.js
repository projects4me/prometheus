/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Factory } from 'miragejs';
import * as date from '../helpers/getDate';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(10, 30);
    },
    dateModified() {
        return date.modifiedDate(5, 7);
    },
    deleted: '0',
    createdUser: '1',
    modifiedUser: '1',
    type: 'relates'
});
