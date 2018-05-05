/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from 'lodash';
import { inject } from '@ember/service';

/**
 * This utility class is used to format data
 *
 * @class Format
 * @namespace Prometheus.Utils
 * @module Data
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default {

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    i18n: inject(),

    /**
     * This function converts model to tree
     *
     * @method getSelectList
     * @param {Prometheus.Models.Object} model The model that needs to be converted
     * @return {Array} list The array list of name and values
     */
    getSelectList:function(model = {} ,map,blank){
        if (_.keys(model).length === 0) {
            return [];
        }
        let count = model.get('length');
        let list = [];
        let temp = null;

        for (let i=0;i<count;i++)
        {
            temp = model.objectAt(i);
            if (map)
            {
                list[i] = _.mapValues(map,function(o){return temp.get(o)});
            } else {
                list[i] = {label:temp.get('name'), value:temp.get('id')};
            }

        }

        if (blank)
        {
            list.unshift({label:blank, value:''});
        }

        return list;
    },

    /**
     * This function is used to get the list from translations
     *
     * @method getList
     * @param list
     * @param locale
     * @return {Array}
     */
    getList(list,locale){
        const translations = require("prometheus/locales/"+locale+"/translations").default;
        let listTranslation = _.head(_.at(translations,list));
        let l = [];
        _.mapKeys(listTranslation,function(label, value){
            l.push({"label":label,"value":value});
        });
        return l;

    }
};