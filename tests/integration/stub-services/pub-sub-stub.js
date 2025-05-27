/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import Evented from '@ember/object/evented';

/**
 * @class PubSubStub
 * @namespace Prometheus.Tests
 * @extends Ember.Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class PubSubStub extends Service {
  constructor() {
    super(...arguments);
    Evented.apply(this);
  }
}