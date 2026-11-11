// must stay first: ember-qunit reads @ember/test/adapter when it loads
import './helpers/ember-testing-adapter';
import './helpers/test-helpers-legacy-paths';
import Application from 'prometheus/app';
import config from 'prometheus/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

import { setupDeprecationReporting } from './helpers/deprecations';

setupDeprecationReporting(QUnit);
setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();

// COVERAGE=true: load every module so untested files count, then post the report to the coverage middleware.
QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

loadTests();
start();
