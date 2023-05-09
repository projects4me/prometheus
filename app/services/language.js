/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
/**
 * This is a service that provides all information related to languages. This service can be injected
 * anywhere in the application
 *
 * @class LanguageService
 * @namespace Prometheus.Services
 * @extends Ember.service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class LanguageService extends Service {

    /**
     * The language selected by user.
     *
     * @property selectedLanguage
     * @for LanguageService
     * @type String
     * @protected
     */
    selectedLanguage = null;

    /**
     * This function returns list of all available languages.
     * 
     * @method get
     * @for LanguageService
     * @public
     * @returns Array
     */
    get languagesList() {
        return [
            {
                label: "English",
                value: "en"
            },
            {
                label: "German",
                value: "de"
            },
            {
                label: "Chinese",
                value: "zh"
            },
            {
                label: "Dutch",
                value: "dl"
            },
            {
                label: "French",
                value: "fr"
            },
            {
                label: "Urdu",
                value: "ur"
            }
        ]
    };

    /**
     * This function sets language, selected by the user.
     * 
     * @method setLanguage
     * @for LanguageService
     * @public
     */
    setLanguage(language) {
        this.selectedLanguage = language;
    }
}
