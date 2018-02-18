/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { run } from '@ember/runloop';

export default function destroyApp(application) {
  run(application, 'destroy');
}
