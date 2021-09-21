import yadda from 'yadda';
import defaultScenario from '../../../mirage/scenarios/default';
import * as signIn from './sign-in-feature-steps';
import * as formField from './form-field-steps';
import * as navigation from './navigation-steps';
import * as signedIn from './sign-in-steps';
import * as issueCreate from './issue-create-steps';
import * as date from './date-steps';

export default function (assert) {
    // debugger;
    defaultScenario(server);
    var modules = new Array(signIn, formField, navigation, signedIn, issueCreate, date);
    var assertion = assert;
    var yaddaa = yadda.localisation.default.library();
    debugger;
    for (var i = 0; i < modules.length; i++) {
        var curr_module = modules[i];
        // debugger;
        var givenArray = (typeof curr_module.given === 'function') ? curr_module.given() : '';
        var whenArray = (typeof curr_module.when === 'function') ? curr_module.when() : '';
        var thenArray = (typeof curr_module.then === 'function') ? curr_module.then() : '';
        for (let j = 0; j < givenArray.length; j++) {
            let given = givenArray[j];
            let givenKey = Object.keys(given)[j];
            let givenFunc = given[givenKey];
            yaddaa.given(givenKey, givenFunc(assertion));
            // debugger;
        }
        for (let j = 0; j < whenArray.length; j++) {
            let when = whenArray[j];
            let whenKey = Object.keys(when)[0];
            let whenFunc = when[whenKey];
            yaddaa.when(whenKey, whenFunc(assertion));
            // debugger;
        }
        for (let j = 0; j < thenArray.length; j++) {
            let then = thenArray[j];
            let thenKey = Object.keys(then)[0];
            let thenFunc = then[thenKey];
            yaddaa.then(thenKey, thenFunc(assertion));
            // debugger;
        }

    }
    return yaddaa;
}
