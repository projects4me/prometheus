/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import format from "prometheus/utils/data/format";
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

/**
 * This component is used to render the application header
 *
 * @class ApplicationHeader
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ApplicationHeaderComponent extends Component {
    /**
     * We are using the store service to retrieve data for global search
     *
     * @property store
     * @type Service
     * @for ApplicationHeader
     * @private
     */
    @service store;

    /**
     * We are using the store service to retrieve data for global search
     *
     * @property page
     * @type Integer
     * @for ApplicationHeader
     * @private
     */
    page = 0;

    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for ApplicationHeader
     */
    @service currentUser;

    /**
     * This function returns session object
     *
     * @method get
     * @public
     */
    get session() {
        return this.args.session;
    }

    /**
     * This function returns 'invalidateSession' property coming from parent(app.js) as an argument in order to
     * invalidate the session and signout user from app
     *
     * @method get
     * @public
     */
    get invalidateSession() {
        return this.args.invalidateSession;
    }

    /**
     * This function returns user profile
     *
     * @method get
     * @public
     */
    get userProfile() {
        return this.args.userProfile;
    }

    /**
     * This function returns item searched by user
     *
     * @method get
     * @public
     */
    get searchedItem() {
        return this.args.searchedItem;
    }

    

    /**
     * This function loads the search data
     *
     * @param query
     * @return {RSVP.Promise|Test.Promise|*}
     */
    loadSearchData(query) {
        let _self = this;
        let options = {
            query: '((Issue.issueNumber CONTAINS ' + query + ') OR (Issue.subject CONTAINS ' + query + ') OR (Issue.description CONTAINS ' + query + '))',
            rels: 'ownedBy,assignedTo,milestone,project,createdBy,modifiedBy,reportedBy,issuetype',
            limit: 5,
            page: this.get('page'),
        };

        return new RSVP.Promise((resolve) => {
            resolve(_self.get('store').query('issue', options));
        });
    }

    /**
     * This is the task that is used to perform the search.
     *
     * @property search
     * @type task
     * @for ApplicationHeader
     * @public
     */
    @task *search(query) {
        yield timeout(500);
        let _self = this;
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            projectId: 'projectId'
        };

        return _self.loadSearchData(query).then(function (data) {
            return format.getSelectList(data, map);
        });
    }

    /**
     * This function is used to select a searched item
     *
     * @method itemSelected
     * @for ApplicationHeader
     * @public
     */
    @action itemSelected(item) {
        let _self = this;
        _self.set('selected', item);
        if (item !== null && typeof this.searchedItem === 'function') {
            get(this, 'searchedItem')(item);
        }
    }

    /**
     * This function is used to forward the signOut function
     *
     * @method signOut
     * @for ApplicationHeader
     * @public
     */
    @action signOut() {
        if (typeof this.invalidateSession === 'function') {
            get(this, 'invalidateSession')();
        }
    }

    /**
     * This function is used to forward the user profile function
     *
     * @method viewProfile
     * @for ApplicationHeader
     * @public
     */
    @action viewProfile() {
        if (typeof this.userProfile === 'function') {
            get(this, 'userProfile')();
        }
    }

    /**
     * This function should not be triggered
     *
     * @method signIn
     * @for ApplicationHeader
     * @public
     */
    signIn() {

    }

}
