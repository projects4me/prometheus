/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

export default function destroyApp(application) {
  Ember.run(application, 'destroy');
}
