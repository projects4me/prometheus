/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";

/**
 * This is the controller for the calendar controller route
 *
 * @class Calendar
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend({

    /**
     * Locale value, the default is en
     *
     * @property localeCode
     * @type String
     * @for Calendar
     * @private
     */
    localeCode: 'en',

    /**
     * These are the header option for the calendar
     *
     * @property header
     * @type Object
     * @for Calendar
     * @public
     */
    header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek'
    },

    /**
     * The events
     *
     * @property events
     * @type Objects
     * @for Calendar
     * @public
     */
    events: null,

    /**
     * These are the actions that are handled by this controller
     *
     * @property actions
     * @type Object
     * @for Calendar
     * @public
     */
    actions: {

        /**
         * This is the function that handled the click event
         *
         * @method clicked
         * @param {Object} event
         * @public
         */
        clicked(event){
            this.showModal(event);
        },

        /**
         * This function handles the event where the drag is started
         *
         * @method eventDragStart
         * @param {Object} event
         * @public
         */
        eventDragStart(event){
            Logger.debug("AppProjectCalendarController::eventDragStart()");
            Logger.debug(event);
        },

        /**
         * This function handles the action when the view has been rendered
         *
         * @method eventRender
         * @param {Object} event
         * @param {Object} eventElement
         * @public
         */
        eventRender(event,eventElement){
            let self = this;
            if (event.priority)
            {
                eventElement.find('div.fc-content').prepend(this.getPriorityHTML(event.priority));
                eventElement.find('td.fc-list-item-title').prepend(this.getPriorityHTML(event.priority));
            }
            if (event.className)
            {
                let tooltip = self.get('i18n').t("views.app.issue.lists.priority."+event.priority);
                tooltip += ' '+self.get('i18n').t("views.app.issue.priority");
                tooltip += ' - '+self.get('i18n').t("views.app.issue.lists.status."+event.className);
                eventElement.find('div.fc-content').attr('data-toggle','tooltip');
                eventElement.find('div.fc-content').attr('title',tooltip);
                //eventElement.find('td.fc-list-item-title').prepend(this.getPriorityHTML(event.priority));
            }
        },

    }, // end definition actions


    /**
     * This function used to retrieve HTML tag for a priority
     *
     * @method getPriorityHTML
     * @param priority
     * @return {string}
     * @public
     */
    getPriorityHTML:function(priority){
        let HTML = '';
        switch (priority) {
            case 'blocker':
                HTML += '<i class="fa fa-ban"></i>';
                break;
            case 'critical':
                HTML += '<i class="fa fa-angle-double-up"></i>';
                break;
            case 'high':
                HTML += '<i class="fa fa-arrow-up"></i>';
                break;
            case 'medium':
                HTML += '<i class="fa fa-dot-circle-o"></i>';
                break;
            case 'low':
                HTML += '<i class="fa fa-arrow-down"></i>';
                break;
            case 'lowest':
                HTML += '<i class="fa fa-angle-double-down"></i>';
                break;
            default:
                break;
        }
        return HTML;
    }

});