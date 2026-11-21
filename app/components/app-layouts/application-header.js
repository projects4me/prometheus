/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { service } from '@ember/service';
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
     * Ranked issue search used by the global search
     *
     * @property issueSearch
     * @type Service
     * @for ApplicationHeader
     * @private
     */
    @service('search') issueSearch;
    
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
     * Sign-In eligibility shared with the sign-in route.
     *
     * @property signInControl
     * @type Ember.Service
     * @for ApplicationHeader
     * @private
     */
    @service('sign-in-control') signInControl;
    
    /**
     * True when the last global search ran without matching by meaning (Ares could not embed the query)
     *
     * @property semanticUnavailable
     * @type Boolean
     * @for ApplicationHeader
     * @public
     */
    @tracked semanticUnavailable = false;

    /**
     * True when the last global search failed; the dropdown says so instead of "no results"
     *
     * @property searchFailed
     * @type Boolean
     * @for ApplicationHeader
     * @public
     */
    @tracked searchFailed = false;

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
     * This is the task that is used to perform the search. Each option carries what the dropdown shows and what
     * opening the issue needs: number and project.
     *
     * @property search
     * @type task
     * @for ApplicationHeader
     * @public
     */
    search = task(async (query) => {
        await timeout(500);
        let found = null;
        try {
            found = await this.issueSearch.issues(query);
        } catch {
            // Shown as the dropdown's message below
        }
        if (this.isDestroying || this.isDestroyed) {
            return [];
        }
        this.searchFailed = found === null;
        this.semanticUnavailable = found?.semanticUnavailable ?? false;
        const results = found?.results ?? [];
        return results.map(({ issue, snippet, pinned }) => ({
            id: issue.id,
            name: issue.subject,
            number: issue.issueNumber,
            status: issue.status,
            project: issue.project,
            snippet,
            pinned
        }));
    });

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
     * Closes the create-module dropdown
     *
     * @method closeCreateDropdown
     * @for ApplicationHeader
     * @public
     */
    @action closeCreateDropdown() {
        this.isCreateDropdownOpen = false;
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
     * Whether the header Sign-In control is interactive.
     *
     * @property isHeaderSignInEnabled
     * @type Boolean
     */
    get isHeaderSignInEnabled() {
        return this.signInControl.isHeaderSignInEnabled;
    }

    /**
     * Routes to the sign-in page when the control is enabled.
     *
     * @method signIn
     * @for ApplicationHeader
     * @public
     */
    @action signIn() {
        if (!this.signInControl.isHeaderSignInEnabled) {
            return;
        }

        this.router.transitionTo('signin');
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
