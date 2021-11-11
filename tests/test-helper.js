import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import { registerAsyncHelper } from '@ember/test';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';

const App = Application.create(config.APP)
setApplication(App);
registerAsyncHelper('signInUser', async function () {
    await visit('/signin');
    await fillIn('input#username', 'hammad');
    await fillIn('input#password', 'hammad');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1500));
    server["customDataProject"] = (schema) => {
        let model = { data: [] }
        let data = schema.projects.find(3);
        model.data.push({
            type: 'project',
            attributes: data,
            id: 3
        });
        return model;
    }
    await visit('/app/project/3/issue/create');
    await new Promise(resolve => setTimeout(resolve, 100000));
    // await new Promise(resolve => setTimeout(resolve, 80000));
    /* eslint-disable no-undef */ 
    assert.equal(currentURL(), '/app/project/3/issue/create');

})
App.injectTestHelpers();
start();