import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
    name() {
        return faker.internet.userName();
    },
    title() {
        return faker.name.jobTitle();
    },
    afterCreate(user) {
        user.update({
            "name": `User_${user.id}`,
        });
    }
});