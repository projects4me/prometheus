import { JSONAPISerializer } from 'ember-cli-mirage';
import { singularize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
    typeKeyForModel(model) {
        return singularize(model.modelName);  
    },
    alwaysIncludeLinkageData: true,
    keyForAttribute(key) {
        return camelize(key);
    },
    keyForRelationship(key) {
        return camelize(key);
    },
    include: ["milestones","members","issuetypes","dashboard", "project"]
});
