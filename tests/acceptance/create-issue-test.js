import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import defaultScenario from '../../mirage/scenarios/default';
import { registerAsyncHelper } from '@ember/test';

module('Acceptance | create issue', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /create-issue', async function (assert) {
    defaultScenario(server);
    signInUser();
    // debugger;
    // await visit('/signin');
    // await fillIn('input#username', 'hammad');
    // await fillIn('input#password', 'hammad');
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // await click('button[type="submit"]');
    // await new Promise(resolve => setTimeout(resolve, 1500));
    // await new Promise(resolve => setTimeout(resolve, 800));
    // debugger;
    // server["customDataProject"] = (schema) => {
    //   debugger;
    //   let model = { data: [] }
    //   let data = schema.projects.find(3);
    //   model.data.push({
    //     type: 'project',
    //     attributes: data,
    //     id: 3
    //   });
    //   return model;
    // }
    // await visit('/app/project/3/issue/create');
    // await new Promise(resolve => setTimeout(resolve, 100000));
    // debugger;
    // console.log(currentURL());
    // // await new Promise(resolve => setTimeout(resolve, 80000));
    // assert.equal(currentURL(), '/app/project/3/issue/create');
  });
});
