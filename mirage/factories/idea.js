import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    projectId() {
        return (_.random(1, 10)).toString();
    },
    title() {
        return faker.lorem.words(3);
    },
    description() {
        return faker.lorem.sentence();
    },
    status: 'open',
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(1, 5);
    }
});
