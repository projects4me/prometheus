/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Calendar Header Component for navigation and view controls
 *
 * @class CalendarHeaderComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarHeaderComponent extends Component {
    @service intl;

    /**
     * Available calendar views
     */
    get availableViews() {
        return [
            { value: 'day', label: this.intl.t('calendar.views.day'), icon: 'calendar-day' },
            { value: 'week', label: this.intl.t('calendar.views.week'), icon: 'calendar-week' },
            { value: 'month', label: this.intl.t('calendar.views.month'), icon: 'calendar' }
        ];
    }

    /**
     * Get formatted current date based on view
     */
    get formattedCurrentDate() {
        const date = this.args.currentDate;
        const view = this.args.currentView;

        if (!date) return '';

        const options = {};

        switch (view) {
            case 'day':
                options.weekday = 'long';
                options.year = 'numeric';
                options.month = 'long';
                options.day = 'numeric';
                break;
            case 'week':
                // For week view, show the week range
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                    return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
                } else {
                    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                }
            case 'month':
            default:
                options.year = 'numeric';
                options.month = 'long';
                break;
        }

        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Get navigation button labels based on current view
     */
    get navigationLabels() {
        const view = this.args.currentView;
        
        switch (view) {
            case 'day':
                return {
                    previous: this.intl.t('calendar.navigation.previous_day'),
                    next: this.intl.t('calendar.navigation.next_day')
                };
            case 'week':
                return {
                    previous: this.intl.t('calendar.navigation.previous_week'),
                    next: this.intl.t('calendar.navigation.next_week')
                };
            case 'month':
            default:
                return {
                    previous: this.intl.t('calendar.navigation.previous_month'),
                    next: this.intl.t('calendar.navigation.next_month')
                };
        }
    }

    /**
     * Check if we can navigate to previous period
     */
    get canGoToPrevious() {
        // Add any business logic for limiting backward navigation
        return true;
    }

    /**
     * Check if we can navigate to next period
     */
    get canGoToNext() {
        // Add any business logic for limiting forward navigation
        return true;
    }

    /**
     * Handle view change
     */
    @action
    handleViewChange(event) {
        const newView = event.target.value;
        if (this.args.onViewChange) {
            this.args.onViewChange(newView);
        }
    }

    /**
     * Handle view button click
     */
    @action
    handleViewButtonClick(view) {
        if (this.args.onViewChange) {
            this.args.onViewChange(view);
        }
    }

    /**
     * Handle previous navigation
     */
    @action
    handlePrevious() {
        if (this.canGoToPrevious && this.args.onPrevious) {
            this.args.onPrevious();
        }
    }

    /**
     * Handle next navigation
     */
    @action
    handleNext() {
        if (this.canGoToNext && this.args.onNext) {
            this.args.onNext();
        }
    }

    /**
     * Handle today button click
     */
    @action
    handleToday() {
        if (this.args.onToday) {
            this.args.onToday();
        }
    }

    /**
     * Handle date picker change
     */
    @action
    handleDatePickerChange(event) {
        const selectedDate = new Date(event.target.value);
        if (this.args.onDateChange) {
            this.args.onDateChange(selectedDate);
        }
    }

    /**
     * Handle weekend toggle
     */
    @action
    handleWeekendToggle() {
        if (this.args.onToggleWeekends) {
            this.args.onToggleWeekends();
        }
    }

    /**
     * Get current date for date input
     */
    get currentDateValue() {
        if (!this.args.currentDate) return '';
        
        const date = new Date(this.args.currentDate);
        return date.toISOString().split('T')[0];
    }

    /**
     * Check if current date is today
     */
    get isToday() {
        if (!this.args.currentDate) return false;
        
        const today = new Date();
        const current = new Date(this.args.currentDate);
        
        return today.getDate() === current.getDate() &&
               today.getMonth() === current.getMonth() &&
               today.getFullYear() === current.getFullYear();
    }

    /**
     * Handle keyboard navigation
     */
    @action
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.handlePrevious();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.handleNext();
                break;
            case 'Home':
                event.preventDefault();
                this.handleToday();
                break;
            case '1':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.handleViewButtonClick('day');
                }
                break;
            case '2':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.handleViewButtonClick('week');
                }
                break;
            case '3':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.handleViewButtonClick('month');
                }
                break;
        }
    }
}
