import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    ideaId() {
        return (_.random(1, 10)).toString();
    },
    version: 1,
    body() {
        return faker.lorem.paragraph();
    },
    status: 'draft',
    error: null,
    dateCreated() {
        return date.createdDate(10, 20);
    }
});
