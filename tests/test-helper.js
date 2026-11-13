// must stay first: ember-qunit reads @ember/test/adapter when it loads
import './helpers/ember-testing-adapter';
import './helpers/test-helpers-legacy-paths';
// ember-data 4.12's RequestManager loads @ember/test-waiters with importSync (a runtime require) in test builds.
// Importing it here makes ember-auto-import register the module with the loader.
import '@ember/test-waiters';
import Application from 'prometheus/app';
import config from 'prometheus/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setConfig as setDropdownConfig } from 'ember-basic-dropdown/config';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

import { setupDeprecationReporting } from './helpers/deprecations';

setupDeprecationReporting(QUnit);
setApplication(Application.create(config.APP));

// The app renders dropdowns into <BasicDropdownWormhole /> in its application template. Tests run inside #ember-testing,
// and integration tests have no application template: point ember-basic-dropdown there.
setDropdownConfig({ rootElement: config.APP.rootElement });

setup(QUnit.assert);
setupEmberOnerrorValidation();

// COVERAGE=true: load every module so untested files count, then post the report to the coverage middleware.
QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

loadTests();
start();
