/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from 'lodash';
import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';

/* global require */

/**
 * This utility class is used to format data
 *
 * @class Format
 * @namespace Prometheus.Utils
 * @module Data
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class Format {

    constructor(context) {
        setOwner(this, getOwner(context));
    }

    /**
     * The intl library service that is used in order to get the translations.
     *
     * @property intl
     * @type Ember.Service
     * @for Prometheus.Utils.Data
     * @public
     */
    @service intl;

    /**
     * This function converts model to tree
     *
     * @method getSelectList
     * @param {Prometheus.Models.Object} model The model that needs to be converted
     * @return {Array} list The array list of name and v.alues
     */
    getSelectList(model = {}, map, blank) {
        if (_.keys(model).length === 0) {
            return [];
        }
        let count = model.get('length');
        let list = [];
        let temp = null;

        for (let i = 0; i < count; i++) {
            temp = model.objectAt(i);
            if (map) {
                list[i] = _.mapValues(map, function (o) { return temp.get(o) });
            } else {
                list[i] = { label: temp.get('name'), value: temp.get('id') };
            }

        }

        if (blank) {
            list.unshift({ label: blank, value: '' });
        }
        return list;
    }

    /**
     * This function is used to get the list from translations.
     *
     * @method getList
     * @param list
     * @param locale
     * @return {Array}
     */
    getList(list) {
        const translations = require("prometheus/locales/" + this.intl.locale + "/translations").default;
        let listTranslation = _.head(_.at(translations, list));
        let l = [];
        _.mapKeys(listTranslation, function (label, value) {
            l.push({ "label": label, "value": value });
        });
        return l;

    }
    /**
     * This function firstly get required list from translations and make change in model by
     * passing the model name as key to the list in order to get translated value of model (if present in
     * list, returned by the translation). Then it pass that model to getSelectList function to prepare
     * select list that will be shared to Form Field.
     *
     * @method getTranslatedModelList
     * @param model
     * @param listPath
     * @param locale
     * @return {Array}
     */
    getTranslatedModelList(model, listPath) {
        let _self = this;
        model.forEach((model) => {
            let translatedName = _self.intl.t(`${listPath}.${model.name}`);
            model.name = translatedName;
        });
        return this.getSelectList(model);
    }
}