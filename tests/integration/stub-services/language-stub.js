/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';

export default class LanguageStub extends Service {
    get languagesList() {
        return [
            {
                label: "English",
                value: "en"
            }, 
            {
                label: "German",
                value: "de"                
            }
        ]
    }
}