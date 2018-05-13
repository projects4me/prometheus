/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import RSVP from 'rsvp';
import $ from "jquery";
import format from "prometheus/utils/data/format";

/**
 * This component is used to render the application header
 *
 * @class ApplicationHeader
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The tag to be used for this component
     *
     * @property tagName
     * @for ApplicationHeader
     * @type String
     * @private
     */
    tagName: 'header',

    /**
     * The classes to be rendered with the element
     *
     * @property classNames
     * @for ApplicationHeader
     * @type Array
     * @private
     */
    classNames: ["main-header"],

    store:inject(),

    searchPromise: null,
    page: 0,
    query:null,

    loadIssue(query){
        let _self = this;
        let options = {
            query: query,
            rels: 'ownedBy,assignedTo,milestone,project,createdBy,modifiedBy,reportedBy,issuetype',
            limit: 10,
            page: this.get('page'),
        };

        //(Issue.subject starts a)
        return new RSVP.Promise((resolve) => {
            resolve(_self.get('store').query('issue',options));
        });
    },

    /**
     * These are the actions that are supported by this component
     *
     * @property actions
     * @for ApplicationHeader
     * @type Object
     * @public
     */
    actions:{
        search(query) {
            let _self = this;
            let map = {
                id:'id',
                name:'subject',
                number:'issueNumber',
                status:'status',
                projectId:'projectId'
            };

            _self.loadIssue(query).then(function(data){
                Logger.debug(data);
                let searchRes = format.getSelectList(data, map);
                Logger.debug(_.clone(searchRes));
                _self.set('searchPromise', searchRes);
            });
            // this.set('searchPromise', this.loadIssue(query));
        },

        /**
         * This function is used to forward the signOut function
         *
         * @method signOut
         * @for ApplicationHeader
         * @public
         */
        signOut(){

            if (typeof this.invalidateSession === 'function')
            {
                get(this, 'invalidateSession')();
            }

        },

        /**
         * This function is used to forward the user profile function
         *
         * @method viewProfile
         * @for ApplicationHeader
         * @public
         */
        viewProfile(){

            if (typeof this.userProfile === 'function')
            {
                get(this, 'userProfile')();
            }

        },

        /**
         * This function should not be triggered
         *
         * @method signIn
         * @for ApplicationHeader
         * @public
         */
        signIn(){

        }
    }
});
