import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    ideaId() {
        return (_.random(1, 10)).toString();
    },
    body() {
        return faker.lorem.sentence();
    },
    kind: 'user',
    steps() {
        return [];
    },
    screens() {
        return [];
    },
    ideaplanId: null,
    costUsd: 0,
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    createdUserName: 'User',
    dateCreated() {
        return date.createdDate(10, 20);
    }
});
