import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import _ from 'lodash';

export default Factory.extend({
    userId() {
        return (_.random(1, 10)).toString();
    },
    entity() {
        return 'App';
    },
    readF() {
        return faker.random.arrayElement(["0", "9"]);
    },
    searchF() {
        return faker.random.arrayElement(["0", "9"]);
    },
    updateF() {
        return faker.random.arrayElement(["0", "9"]);
    },
    deleteF() {
        return faker.random.arrayElement(["0", "9"]);
    },
    importF() {
        return faker.random.arrayElement(["0", "9"]);
    },
    exportF() {
        return faker.random.arrayElement(["0", "9"]);
    }
});
