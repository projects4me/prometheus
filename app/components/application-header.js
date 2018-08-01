/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import RSVP from 'rsvp';
import format from "prometheus/utils/data/format";
import { task, timeout } from 'ember-concurrency';

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

    /**
     * We are using the store service to retrieve data for global search
     *
     * @property store
     * @type Service
     * @for ApplicationHeader
     * @private
     */
    store:inject(),

    /**
     * We are using the store service to retrieve data for global search
     *
     * @property page
     * @type Integer
     * @for ApplicationHeader
     * @private
     */
    page:0,

    /**
     * This function loads the search data
     *
     * @param query
     * @return {RSVP.Promise|Test.Promise|*}
     */
    loadSearchData(query){
        let _self = this;
        let options = {
            query: '((Issue.issueNumber CONTAINS '+query+') OR (Issue.subject CONTAINS '+query+') OR (Issue.description CONTAINS '+query+'))',
            rels: 'ownedBy,assignedTo,milestone,project,createdBy,modifiedBy,reportedBy,issuetype',
            limit: 5,
            page: this.get('page'),
        };

        return new RSVP.Promise((resolve) => {
            resolve(_self.get('store').query('issue',options));
        });
    },

    /**
     * This is the task that is used to perform the search.
     *
     * @property search
     * @type task
     * @for ApplicationHeader
     * @public
     */
    search: task(function* (query) {
        yield timeout(500);
        let _self = this;
        let map = {
            id:'id',
            name:'subject',
            number:'issueNumber',
            status:'status',
            projectId:'projectId'
        };

        return _self.loadSearchData(query).then(function(data){
            return format.getSelectList(data, map);
        });
    }),

    /**
     * These are the actions that are supported by this component
     *
     * @property actions
     * @for ApplicationHeader
     * @type Object
     * @public
     */
    actions:{

        /**
         * This function is used to select a searched item
         *
         * @method itemSelected
         * @for ApplicationHeader
         * @public
         */
        itemSelected(item){
            let _self = this;
            _self.set('selected', item);
            if (item !== null && typeof this.searchedItem === 'function')
            {
                get(this, 'searchedItem')(item);
            }

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
