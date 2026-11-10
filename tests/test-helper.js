import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { setup } from 'qunit-dom';

import { setupDeprecationReporting } from './helpers/deprecations';

setupDeprecationReporting(QUnit);
const App = Application.create(config.APP)
setup(QUnit.assert);
setApplication(App);
App.injectTestHelpers();
start();