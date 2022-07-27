import yadda from 'yadda';
import Context from '../../../mirage/yadda-context/context';
import * as signIn from './sign-in-steps';
import * as formField from './form-field-steps';
import * as navigation from './navigation-steps';
import * as issueCreate from './issue/create-issue-steps';
import * as date from './date-steps';
import * as updateIssueStatus from './update-issue-status-steps';
import * as mirageServerConfig from './mirage/mirage-server-config-steps';
import * as createListOfFactory from './mirage/create-list-of-factory-steps';
import * as signout from './sign-out-steps';
import * as globalSearch from './global-search-steps';
import * as filterIssuesBoard from './taskboard/filter-issues-steps';
import * as toggleMilestoneBox from './taskboard/toggle-milestone-box-steps';
import * as redirectToSocialLinks from './redirect-to-user-social-links-steps';
import * as checkIssuesListIssueToday from './dashboard/issue-today/check-list-of-issue-steps';
import * as searchIssueFromIssueToday from './dashboard/issue-today/search-issue-from-list-steps';
import * as selectIssueFromIssueToday from './dashboard/issue-today/select-and-navigate-to-issue-steps';
import * as renderListOfProjects from './project/render-list-of-projects-steps';
import * as renderListOfIssues from './issue/render-list-of-issues-steps';
import * as projectCreate from './project/create-project-steps';
import * as projectSearchFromList from './project/search-project-from-list-steps';
import * as issueSearchFromList from './issue/search-issue-from-list-steps';
import * as selectAndNavigateToProject from './project/select-and-navigate-to-project-steps';
import * as selectAndNavigateToIssue from './issue/select-and-navigate-to-issue-steps';

export default function (assert) {
    let modules = new Array(signIn, formField, navigation, issueCreate, date, updateIssueStatus, mirageServerConfig, createListOfFactory, signout, globalSearch, filterIssuesBoard, redirectToSocialLinks, checkIssuesListIssueToday, searchIssueFromIssueToday, selectIssueFromIssueToday, projectCreate, toggleMilestoneBox, renderListOfProjects, projectSearchFromList, selectAndNavigateToProject, renderListOfIssues, issueSearchFromList, selectAndNavigateToIssue);
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
