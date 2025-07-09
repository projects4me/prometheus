/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Workflow Node Component
 * Represents a single node in the workflow designer
 *
 * @class WorkflowWorkflowNodeComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkflowWorkflowNodeComponent extends Component {
    @tracked isDragging = false;
    @tracked isHovered = false;

    /**
     * Get node style based on type and position
     *
     * @method get nodeStyle
     * @return {String} CSS style string
     * @public
     */
    get nodeStyle() {
        const { positionX, positionY } = this.args.node;
        const baseStyle = `
            position: absolute;
            left: ${positionX || 0}px;
            top: ${positionY || 0}px;
            transform: translate(-50%, -50%);
            cursor: ${this.isDragging ? 'grabbing' : 'grab'};
            z-index: ${this.args.isSelected ? 1000 : 100};
        `;

        return baseStyle;
    }

    /**
     * Get node class based on type and state
     *
     * @method get nodeClass
     * @return {String} CSS class string
     * @public
     */
    get nodeClass() {
        const classes = ['workflow-node', `workflow-node--${this.args.node.type}`];
        
        if (this.args.isSelected) {
            classes.push('workflow-node--selected');
        }
        
        if (this.isHovered) {
            classes.push('workflow-node--hovered');
        }
        
        if (this.isDragging) {
            classes.push('workflow-node--dragging');
        }

        return classes.join(' ');
    }

    /**
     * Get node icon based on type
     *
     * @method get nodeIcon
     * @return {String} Font Awesome icon class
     * @public
     */
    get nodeIcon() {
        const iconMap = {
            start: 'fa-play-circle',
            end: 'fa-stop-circle',
            task: 'fa-square',
            gateway: 'fa-diamond',
            event: 'fa-circle'
        };
        
        return iconMap[this.args.node.type] || 'fa-circle';
    }

    /**
     * Get node color based on type
     *
     * @method get nodeColor
     * @return {String} Color hex code
     * @public
     */
    get nodeColor() {
        const colorMap = {
            start: '#28a745',
            end: '#dc3545',
            task: '#007bff',
            gateway: '#ffc107',
            event: '#6c757d'
        };
        
        return colorMap[this.args.node.type] || '#6c757d';
    }

    /**
     * Get parsed node properties
     *
     * @method get nodeProperties
     * @return {Object} Parsed properties object
     * @public
     */
    get nodeProperties() {
        try {
            return JSON.parse(this.args.node.properties || '{}');
        } catch (e) {
            return {};
        }
    }

    /**
     * Handle node click
     *
     * @method handleClick
     * @param {Event} event Click event
     * @public
     */
    @action handleClick(event) {
        event.stopPropagation();
        this.args.onSelect?.(this.args.node);
    }

    /**
     * Handle node double click
     *
     * @method handleDoubleClick
     * @param {Event} event Double click event
     * @public
     */
    @action handleDoubleClick(event) {
        event.stopPropagation();
        // Open properties panel or inline editor
        this.args.onSelect?.(this.args.node);
    }

    /**
     * Handle mouse enter
     *
     * @method handleMouseEnter
     * @public
     */
    @action handleMouseEnter() {
        this.isHovered = true;
    }

    /**
     * Handle mouse leave
     *
     * @method handleMouseLeave
     * @public
     */
    @action handleMouseLeave() {
        this.isHovered = false;
    }

    /**
     * Handle drag start
     *
     * @method handleDragStart
     * @param {Event} event Drag start event
     * @public
     */
    @action handleDragStart(event) {
        this.isDragging = true;
        
        // Store initial mouse position relative to node
        const rect = event.target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        
        event.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'node',
            nodeId: this.args.node.id,
            offsetX,
            offsetY
        }));
        
        event.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Handle drag end
     *
     * @method handleDragEnd
     * @param {Event} event Drag end event
     * @public
     */
    @action handleDragEnd(event) {
        this.isDragging = false;
    }

    /**
     * Handle context menu (right click)
     *
     * @method handleContextMenu
     * @param {Event} event Context menu event
     * @public
     */
    @action handleContextMenu(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Show context menu
        this.showContextMenu(event.clientX, event.clientY);
    }

    /**
     * Show context menu
     *
     * @method showContextMenu
     * @param {Number} x X coordinate
     * @param {Number} y Y coordinate
     * @private
     */
    showContextMenu(x, y) {
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'workflow-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 150px;
        `;

        const menuItems = [
            { label: 'Edit Properties', action: () => this.args.onSelect?.(this.args.node) },
            { label: 'Delete Node', action: () => this.args.onDelete?.(this.args.node), danger: true }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `context-menu-item ${item.danger ? 'danger' : ''}`;
            menuItem.textContent = item.label;
            menuItem.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                ${item.danger ? 'color: #dc3545;' : ''}
            `;
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = item.danger ? '#f8d7da' : '#f8f9fa';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
            });
            
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(menu);
            });
            
            menu.appendChild(menuItem);
        });

        // Remove last border
        const lastItem = menu.lastElementChild;
        if (lastItem) {
            lastItem.style.borderBottom = 'none';
        }

        document.body.appendChild(menu);

        // Remove menu when clicking elsewhere
        const removeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', removeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 0);
    }

    /**
     * Handle connection start (for creating transitions)
     *
     * @method handleConnectionStart
     * @param {Event} event Mouse event
     * @public
     */
    @action handleConnectionStart(event) {
        if (event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            this.args.onStartConnection?.(this.args.node, event);
        }
    }
}
