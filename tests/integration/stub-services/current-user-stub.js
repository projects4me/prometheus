/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import ObjectProxy from '@ember/object/proxy';

export default class CurrentUserStub extends Service {
    user = ObjectProxy.create({
        name: "Rana Nouman",
        createdDate: "Feb-01-2022"
    });
}
