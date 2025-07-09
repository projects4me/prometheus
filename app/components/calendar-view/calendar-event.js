/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Calendar Event Component for displaying issues and milestones
 *
 * @class CalendarEventComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarEventComponent extends Component {
    @service intl;

    /**
     * Get event display data based on type
     */
    get eventData() {
        if (this.args.type === 'milestone') {
            return this.getMilestoneData();
        } else if (this.args.type === 'issue') {
            return this.getIssueData();
        }
        
        return {};
    }

    /**
     * Get milestone display data
     */
    getMilestoneData() {
        const milestone = this.args.milestone;
        
        return {
            title: milestone.name || milestone.title,
            subtitle: milestone.description,
            color: '#ff6b6b',
            icon: 'flag',
            priority: 'milestone',
            status: milestone.status || 'active',
            progress: milestone.progress || 100,
            assignee: milestone.assignee,
            dueDate: milestone.endDate || milestone.startDate
        };
    }

    /**
     * Get issue display data
     */
    getIssueData() {
        const issue = this.args.issue;
        const issueData = this.args.issueData;
        
        return {
            title: issue.subject,
            subtitle: this.getIssueSubtitle(issue),
            color: this.getIssueColor(issue),
            icon: this.getIssueIcon(issue),
            priority: issue.priority || 'medium',
            status: this.getIssueStatus(issue),
            progress: issue.progressPercentage || 0,
            assignee: issue.assignedTo,
            dueDate: issue.endDate,
            issueNumber: issue.issueNumber,
            isStart: issueData?.isStart,
            isEnd: issueData?.isEnd,
            isMiddle: issueData?.isMiddle,
            isOverdue: issue.isOverdue
        };
    }

    /**
     * Get issue subtitle based on view
     */
    getIssueSubtitle(issue) {
        switch (this.args.view) {
            case 'day':
                return `#${issue.issueNumber} • ${this.getIssueStatus(issue)}`;
            case 'week':
                return `#${issue.issueNumber}`;
            case 'month':
            default:
                return issue.issueNumber ? `#${issue.issueNumber}` : '';
        }
    }

    /**
     * Get issue color based on priority and status
     */
    getIssueColor(issue) {
        // Priority-based colors
        const priorityColors = {
            'high': '#e74c3c',
            'medium': '#3498db',
            'low': '#2ecc71'
        };

        // Status-based color overrides
        const status = this.getIssueStatus(issue);
        if (status === 'done' || status === 'closed') {
            return '#95a5a6';
        } else if (issue.isOverdue) {
            return '#e74c3c';
        }

        return priorityColors[issue.priority] || priorityColors['medium'];
    }

    /**
     * Get issue icon based on type and status
     */
    getIssueIcon(issue) {
        const status = this.getIssueStatus(issue);
        
        if (status === 'done' || status === 'closed') {
            return 'check-circle';
        } else if (issue.isOverdue) {
            return 'exclamation-triangle';
        }

        // Type-based icons
        const typeIcons = {
            'bug': 'bug',
            'feature': 'lightbulb',
            'task': 'tasks',
            'story': 'book',
            'epic': 'layer-group'
        };

        const typeName = issue.issuetype?.get?.('name') || issue.typeId;
        return typeIcons[typeName] || 'circle';
    }

    /**
     * Get issue status name
     */
    getIssueStatus(issue) {
        return issue.issuestatus?.get?.('name') || issue.status || 'new';
    }

    /**
     * Get CSS classes for the event
     */
    get eventClasses() {
        const classes = ['calendar-event'];
        const data = this.eventData;
        
        // Type classes
        classes.push(`calendar-event--${this.args.type}`);
        
        // View classes
        classes.push(`calendar-event--${this.args.view}`);
        
        // Priority classes
        if (data.priority) {
            classes.push(`calendar-event--priority-${data.priority}`);
        }
        
        // Status classes
        if (data.status) {
            classes.push(`calendar-event--status-${data.status}`);
        }
        
        // State classes
        if (this.args.isSelected) {
            classes.push('calendar-event--selected');
        }
        
        if (data.isOverdue) {
            classes.push('calendar-event--overdue');
        }
        
        if (this.args.canEdit) {
            classes.push('calendar-event--editable');
        }
        
        // Position classes for multi-day events
        if (this.args.type === 'issue' && this.args.issueData) {
            if (this.args.issueData.isStart) {
                classes.push('calendar-event--start');
            }
            if (this.args.issueData.isEnd) {
                classes.push('calendar-event--end');
            }
            if (this.args.issueData.isMiddle) {
                classes.push('calendar-event--middle');
            }
        }
        
        return classes.join(' ');
    }

    /**
     * Get inline styles for the event
     */
    get eventStyle() {
        const data = this.eventData;
        const styles = [];
        
        // Background color
        if (data.color) {
            styles.push(`background-color: ${data.color}`);
            
            // Adjust text color based on background
            const textColor = this.getContrastColor(data.color);
            styles.push(`color: ${textColor}`);
        }
        
        // Progress bar for issues
        if (this.args.type === 'issue' && data.progress > 0) {
            styles.push(`--progress: ${data.progress}%`);
        }
        
        return styles.join('; ');
    }

    /**
     * Get contrasting text color for background
     */
    getContrastColor(backgroundColor) {
        // Simple contrast calculation
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * Get tooltip text for the event
     */
    get tooltipText() {
        const data = this.eventData;
        const parts = [];
        
        parts.push(data.title);
        
        if (data.subtitle) {
            parts.push(data.subtitle);
        }
        
        if (this.args.type === 'issue') {
            parts.push(`${this.intl.t('calendar.priority')}: ${data.priority}`);
            parts.push(`${this.intl.t('calendar.status')}: ${data.status}`);
            
            if (data.progress > 0) {
                parts.push(`${this.intl.t('calendar.progress')}: ${data.progress}%`);
            }
            
            if (data.assignee) {
                parts.push(`${this.intl.t('calendar.assignee')}: ${data.assignee.name || data.assignee}`);
            }
        }
        
        if (data.dueDate) {
            const dueDate = new Date(data.dueDate);
            parts.push(`${this.intl.t('calendar.due_date')}: ${dueDate.toLocaleDateString()}`);
        }
        
        return parts.join('\n');
    }

    /**
     * Check if event should be draggable
     */
    get isDraggable() {
        return this.args.canEdit && this.args.type === 'issue';
    }

    /**
     * Get truncated title for display
     */
    get displayTitle() {
        const data = this.eventData;
        const maxLength = this.getMaxTitleLength();
        
        if (data.title.length <= maxLength) {
            return data.title;
        }
        
        return data.title.substring(0, maxLength - 3) + '...';
    }

    /**
     * Get maximum title length based on view
     */
    getMaxTitleLength() {
        switch (this.args.view) {
            case 'day':
                return 100; // Long titles in day view
            case 'week':
                return 30;  // Medium titles in week view
            case 'month':
            default:
                return 20;  // Short titles in month view
        }
    }

    /**
     * Handle event click
     */
    @action
    handleClick(event) {
        event.stopPropagation();
        
        if (this.args.onClick) {
            this.args.onClick(event);
        }
    }

    /**
     * Handle event double click
     */
    @action
    handleDoubleClick(event) {
        event.stopPropagation();
        
        if (this.args.onDoubleClick) {
            this.args.onDoubleClick(event);
        }
    }

    /**
     * Handle drag start
     */
    @action
    handleDragStart(event) {
        if (!this.isDraggable) {
            event.preventDefault();
            return;
        }
        
        if (this.args.onDragStart) {
            this.args.onDragStart(event);
        }
    }

    /**
     * Handle context menu (right click)
     */
    @action
    handleContextMenu(event) {
        event.preventDefault();
        
        if (this.args.onContextMenu) {
            this.args.onContextMenu(event);
        }
    }
}
