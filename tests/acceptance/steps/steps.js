import yadda from 'yadda';
import Context from '../../../mirage/yadda-context/context';
import * as signIn from './sign-in-steps';
import * as formField from './form-field-steps';
import * as navigation from './navigation-steps';
import * as issueCreate from './issue-create-steps';
import * as date from './date-steps';
import * as updateIssueStatus from './update-issue-status-steps';
import * as mirageServerConfig from './mirage-server-config-steps';
import * as signout from './sign-out-steps';
import * as globalSearch from './global-search-steps';
import * as filterIssuesBoard from './filter-issues-board-steps';
import * as redirectToSocialLinks from './redirect-to-user-social-links-steps';

export default function (assert) {
    let modules = new Array(signIn, formField, navigation, issueCreate, date, updateIssueStatus, mirageServerConfig, signout, globalSearch, filterIssuesBoard, redirectToSocialLinks);
    let assertion = assert;
    let ctx = new Context();
    let dictionary = new yadda.Dictionary()
        .define('num', /(\d+)/, yadda.converters.integer)
        .define('list', /([^\u0000]*)/, yadda.converters.list)
        .define('table', /([^\u0000]*)/, yadda.converters.table);

    let yaddaa = yadda.localisation.default.library(dictionary);
    for (let i = 0; i < modules.length; i++) {
        let curr_module = modules[i];
        let givenArray = (typeof curr_module.given === 'function') ? curr_module.given() : '';
        let whenArray = (typeof curr_module.when === 'function') ? curr_module.when() : '';
        let thenArray = (typeof curr_module.then === 'function') ? curr_module.then() : '';
        for (let j = 0; j < givenArray.length; j++) {
            let given = givenArray[j];
            let givenKey = Object.keys(given)[0];
            let givenFunc = given[givenKey];
            yaddaa.given(givenKey, givenFunc(assertion, ctx));
        }
        for (let j = 0; j < whenArray.length; j++) {
            let when = whenArray[j];
            let whenKey = Object.keys(when)[0];
            let whenFunc = when[whenKey];
            yaddaa.when(whenKey, whenFunc(assertion, ctx));
        }
        for (let j = 0; j < thenArray.length; j++) {
            let then = thenArray[j];
            let thenKey = Object.keys(then)[0];
            let thenFunc = then[thenKey];
            yaddaa.then(thenKey, thenFunc(assertion, ctx));
        }

    }
    return yaddaa;
}
