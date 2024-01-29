import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

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
    readF() {
        return faker.random.arrayElement(['0', '1', '2', '9']);
    },
    searchF() {
        return faker.random.arrayElement(['0', '1', '2', '9']);
    },
    updateF() {
        return faker.random.arrayElement(['0', '1', '2', '9']);
    },
    deleteF() {
        return faker.random.arrayElement(['0', '1', '2', '9']);
    },
    importF() {
        return faker.random.arrayElement(['0', '1', '2', '9']);
    },
    exportF() {
        return faker.random.arrayElement(['0', '1', '2', '9']);
    },
    roleId() {
        return (_.random(1, 10)).toString();
    }
});
