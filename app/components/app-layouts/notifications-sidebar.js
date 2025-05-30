/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * This component is used to render the notifications sidebar
 * 
 * @class AppLayoutsNotificationsSidebarComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppLayoutsNotificationsSidebarComponent extends Component {
    /**
     * The pub-sub service for handling event communication
     *
     * @property pubSub
     * @type Service
     * @public
     */
    @service('pub-sub') pubSub;

    /**
     * The notifications service
     *
     * @property notifications
     * @type Service
     * @public
     */
    @service('notifications') notifications;
  
    /**
     * Constructor for the notifications sidebar component
     * Subscribes to toggle events when component is initialized
     */
    constructor() {
      super(...arguments);
      this.pubSub.on('toggle-notifications-sidebar', this, this.toggleSidebar);
    }
    
    /**
     * Toggles the visibility of the notifications sidebar by adding/removing
     * the 'notifications-sidebar-open' class on the document body
     *
     * @method toggleSidebar
     * @public
     */
    @action
    toggleSidebar() {
      document.body.classList.toggle('notifications-sidebar-open');
    }
    
    /**
     * Cleanup method called when component is destroyed
     * Unsubscribes from pub-sub events to prevent memory leaks
     */
    willDestroy() {
      super.willDestroy();
      // Clean up subscription
      this.pubSub.off('toggle-notifications-sidebar', this, this.toggleSidebar);
    }    

    /**
     * Marks all notifications as read by calling the notifications service
     * 
     * @method markAllAsRead
     * @public
     * @action
     */
    @action
    markAllAsRead() {
      this.notifications.markAllAsRead();
    }
    
    /**
     * Loads more notifications by calling the notifications service
     * Used by the infinite scroll component to load additional notifications
     * 
     * @method loadMoreNotifications
     * @public
     * @action
     * @async
     * @return {Promise} Promise that resolves when notifications are loaded
     */
    @action
    async loadMoreNotifications() {
      return await this.notifications.loadNotifications(...arguments);
    }
}
