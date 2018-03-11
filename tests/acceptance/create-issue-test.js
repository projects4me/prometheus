import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from 'prometheus/tests/helpers/start-app';
import destroyApp from 'prometheus/tests/helpers/destroy-app';
import { selectChoose, selectSearch, removeMultipleOption, clearSelected } from 'ember-power-select/test-support';

/* eslint-disable no-undef */
describe('Acceptance | create issue', function() {
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('Create Issue', async function(done) {
    this.timeout(10000);
    setTimeout(done, 8000);

    await visit('/signin');
    await fillIn('input#username','hammad');
    await fillIn('input#password','hammad');
    await click('button[type="submit"]');

    await visit('/app/project/f2e540135a9d-e6e3-2423-ac1ef75cd869/issue/create');

    await fillIn("div[data-field='issue.subject'] input",'Test ');
    await fillIn("div[data-field='issue.subject'] textarea",'hammad');
    await selectChoose("div[data-field='issue.type'] .ember-power-select-trigger", 'Epic');
  });
});
/* eslint-enable no-undef */