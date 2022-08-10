import steps from '../steps';
import { singularize } from 'ember-inflector';

export const given = function () {
    return [
        {
            "There are $count $factoryName in system": (assert) => async function (count, factoryName) {
                let singularizedFactoryName = singularize(factoryName);
                server.createList(singularizedFactoryName, parseInt(count));
                assert.ok(true, `User create ${count} ${factoryName}`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}