import { Factory } from 'miragejs';
import * as date from '../helpers/getDate';
import _ from 'lodash';

const NAMES = ['Engineering', 'Marketing', 'Customer Success', 'Product Design', 'Operations', 'Finance', 'Research', 'Support'];
const CODES = ['ENG', 'MKT', 'CS', 'DES', 'OPS', 'FIN', 'RND', 'SUP'];

export default Factory.extend({
    name(i) {
        return NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : '');
    },
    shortCode(i) {
        return CODES[i % CODES.length] + (i >= CODES.length ? Math.floor(i / CODES.length) + 1 : '');
    },
    description(i) {
        return `${NAMES[i % NAMES.length]} workspace`;
    },
    projectCount: 0,
    memberCount: 0,
    dateCreated() {
        return date.createdDate(20, 30);
    },
    dateModified() {
        return date.modifiedDate(1, 6);
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    afterCreate(workspace) {
        workspace.update({ createdUserName: `User_${workspace.createdUser}` });
    }
});
