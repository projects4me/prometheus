import { pluralize } from 'ember-inflector';

export function setModel(modelDetails, model) {
    for (const [fieldName, value] of Object.entries(modelDetails)) {
        if (!isNaN(value)) {
            var [relName, relatedModelName] = getRelatedModelName(fieldName);
            var relValue = server.createList(relatedModelName, parseInt(value));
        } else {
            relName = fieldName;
            relValue = value;
        }
        model.update({
            [relName]: relValue
        });
    }
}

function getRelatedModelName(fieldName) {
    let relName = '';
    let relatedModelName = '';
    let regex = /\([^)]*\)/g;

    //check if user has given relationship name as input or not
    if (regex.test(fieldName)) {
        let splittedString = fieldName.split('(');
        relName = splittedString[0];
        relatedModelName = splittedString[1].slice(0, -1);
    } else {
        relatedModelName = fieldName;
        relName = pluralize(fieldName);
    }

    return [relName, relatedModelName];
}