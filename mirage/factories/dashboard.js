import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(8, 15);
    },
    dateModified() {
        return date.modifiedDate(1, 4);
    },
    "deleted": "0",
    name(i) {
        return `Dashboard_${i}`;
    },
    userId(i) {
        return `${++i}`;
    },
    "widgets": "issuesToday, weeklyMilestones"
});
