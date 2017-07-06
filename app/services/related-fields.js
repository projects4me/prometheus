/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

const { inject: { service } } = Ember;

/**
 * This is the service that is used to mange relate field. In many cased e.g. Owner, AssignedUser, Projects. The total
 * number of these entities in the system are low but they are very widely used throughout the application. In order to
 * ensure good performance we can simply store these lists in the local storage or cookies but alas that is not simple.
 * As a local storage persists over the course of the application and if an update is made in any of the stored lists
 * this would not get updated.
 *
 * This job is this service to retrieve, store, and handle this. In order to do so this service is dependant on
 * ember-simple-auth's Adaptive Storage, Socket.IO service and Ember Data Store Service
 *
 * @class RelatedFieldService
 * @extends Ember.Service
 */
export default Ember.Service.extend({

    /**
     * This is the cached data that we use in order to store the lists we have retrieved
     *
     * @param data
     * @type Array
     * @private
     */
    data:null,

    /**
     * The store is injected as a service
     *
     * @property store
     * @type Service
     * @for RelatedFieldService
     * @private
     */
    store: service('store'),

    /**
     * This function is responsible for retrieving and storing the lists required by dropdowns
     *
     * @param model The name of the model for which the data is required
     * @param fields The fields that should be selected
     * @param queryParams The query based on which the data must be retreived
     * @param valueField The field that will be used as the select identifier
     */
    getRelated:function(model, fields, queryParams, valueField = 'id'){
        Logger.debug("Model");
        Logger.debug(model);
        Logger.debug("Fields");
        Logger.debug(fields);
        Logger.debug("Query Params");
        Logger.debug(queryParams);
        Logger.debug("Value Field");
        Logger.debug(valueField);
        return [{'id':{'name':"Hammad"}}];
    },

    /**
     * This function is responsible for retrieving and storing the lists required by dropdowns
     *
     * @param list
     * @param fields The fields that should be selected
     * @param queryParams The query based on which the data must be retreived
     * @param valueField The field that will be used as the select identifier
     */
    getList:function(list){

        if (list === "issue_type")
        {
            return [
                {value:"epic",label:"Epic"},
                {value:"story",label:"Story"},
                {value:"task",label:"Task"},
                {value:"bug",label:"Bug"},
                {value:"improvement",label:"Improvement"},
            ];
        }
        return [];

    }


});
