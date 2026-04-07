/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import format from "prometheus/utils/data/format";
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import AppComponent from '../app';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to render the application header
 *
 * @class ApplicationHeader
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ApplicationHeaderComponent extends AppComponent {

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
     * The notifications service
     *
     * @property notifications
     * @type Service
     * @for ApplicationHeader
     * @private
     */
    @service notifications;
    /**
     * This property is used to keep track the selected issue
     *
     * @property selected
     * @type String
     * @for ApplicationHeader
     * @private
     */
    @tracked selected;

    /**
     * Controls the visibility of the create-module dropdown
     *
     * @property isCreateDropdownOpen
     * @type Boolean
     * @for ApplicationHeader
     * @private
     */
    @tracked isCreateDropdownOpen = false;

    /**
     * The pub-sub service
     *
     * @property pubSub
     * @type Service
     * @for ApplicationHeader
     * @public
     */
    @service('pub-sub') pubSub;
    
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
     * This function is called when the component is initialized
     * It sets up the click event listener to close the create-module dropdown
     *
     * @method constructor
     * @for ApplicationHeader
     * @public
     */
    constructor() {
        super(...arguments);
        this._handleOutsideClick = () => { this.isCreateDropdownOpen = false; };
        document.addEventListener('click', this._handleOutsideClick);
    }

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
            rels: 'ownedBy,assignedTo,issuemilestone,project,createdBy,modifiedBy,reportedBy,issuetype',
            limit: 5,
            page: this.page,
        };
        return new RSVP.Promise((resolve) => {
            resolve(_self.store.query('issue', options));
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
    @(task(function* (query) {
        yield timeout(500);
        let _self = this;
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            project: 'project'
        };
        return _self.loadSearchData(query).then(function (data) {
            return (new format(_self)).getSelectList(data, map);
        });
    })) search

    /**
     * This function is used to select a searched item
     *
     * @method itemSelected
     * @for ApplicationHeader
     * @public
     */
    @action itemSelected(item) {
        this.selected = item;
        if (item !== null && typeof this.searchedItem === 'function') {
            this.searchedItem(item);
        }
    }


    /**
     * Toggles the create-module dropdown open/closed.
     * stopPropagation prevents the document click listener from immediately closing it.
     *
     * @method toggleCreateDropdown
     * @for ApplicationHeader
     * @public
     */
    @action toggleCreateDropdown(event) {
        event.stopPropagation();
        this.isCreateDropdownOpen = !this.isCreateDropdownOpen;
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
            this.invalidateSession();
            sessionStorage.removeItem('projectId');
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
            this.userProfile();
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

    /**
     * This function is used to toggle the notifications sidebar
     *
     * @method toggleNotificationsSidebar
     * @for ApplicationHeader
     * @public
     */
    @action
    toggleNotificationsSidebar() {
        this.pubSub.trigger('toggle-notifications-sidebar');
    }

    /**
     * This function is called when the component is destroyed
     * It removes the click event listener to close the create-module dropdown
     *
     * @method willDestroy
     * @for ApplicationHeader
     * @public
     */
    willDestroy() {
        super.willDestroy(...arguments);
        document.removeEventListener('click', this._handleOutsideClick);
    }
}
