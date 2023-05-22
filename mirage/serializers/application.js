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
    include: function (request) {
        let rels = request.queryParams.rels;
        let relatedModelKeys = [];
        (rels !== 'none') &&
            (relatedModelKeys = (rels === undefined) ? Object.keys(this.schema.associationsFor(this.type)) : rels.split(','));
        return relatedModelKeys;
    },
    /**
     * This function is overrided in order to add some metadata in the JSON API response to make the
     * pagination functionality in a workable state. More things can be done in future, but currently we're
     * only handling pagination in this method.
     * 
     * @param {*} object 
     * @param {*} request 
     * @returns object
     */
    serialize(object, request) {
        //call parent serialize method. This works like "super" keyword. Concept of backbone.js.
        let json = JSONAPISerializer.prototype.serialize.apply(this, arguments);
        json = this.addMetaData(object, request, json);
        _.set(json, 'meta.count', _.isArray(json.data) ? json.data.length : '1');

        return json;
    },
    /**
     * This function calculates next and previous url by checking the value of limit and page. And after
     * the preparation of url, these urls are added to the json under "meta" tag.
     * 
     * @param {*} object 
     * @param {*} request 
     * @param {*} json 
     * @returns object
     */
    addMetaData(object, request, json) {
        let limit = request.queryParams.limit;
        let page = request.queryParams.page;

        if (page && limit) {
            let nextRecordExists = server.schema.users.all().length > (limit * page);

            if (nextRecordExists) {
                let nextUrl = _.replace(request.url, `page=${page}`, `page=${parseInt(page) + 1}`);
                _.set(json, 'meta.links.next.href', nextUrl);
            }

            if (page > 1) {
                let previousUrl = _.replace(request.url, `page=${page}`, `page=${parseInt(page - 1)}`);
                _.set(json, 'meta.links.prev.href', previousUrl);
            }
        }

        return json;
    }
});
