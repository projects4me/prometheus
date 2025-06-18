import Component from '@glimmer/component';
import { action } from '@ember/object';
export default class GanttChartGanttDependenciesComponent extends Component {
    /**
     * Calculate dependency paths for SVG rendering
     *
     * @method get dependencyPaths
     * @return {Array} Array of dependency path objects
     */
    get dependencyPaths() {
        if (!this.args.taskBars || !this.args.issues) {
            return [];
        }

        const paths = [];
        const taskBarMap = new Map();
        
        // Create a map of issue ID to task bar for quick lookup
        this.args.taskBars.forEach((taskBar, index) => {
            taskBarMap.set(taskBar.issue.id, {
                ...taskBar,
                rowIndex: index
            });
        });

        // Generate paths for each dependency
        this.args.taskBars.forEach((taskBar, index) => {
            const issue = taskBar.issue;
            
            if (issue.dependencyIds && issue.dependencyIds.length > 0) {
                issue.dependencyIds.forEach(dependencyId => {
                    const dependencyTaskBar = taskBarMap.get(dependencyId);
                    
                    if (dependencyTaskBar) {
                        const path = this.calculateDependencyPath(
                            dependencyTaskBar,
                            { ...taskBar, rowIndex: index }
                        );
                        
                        if (path) {
                            paths.push({
                                ...path,
                                fromIssue: dependencyTaskBar.issue,
                                toIssue: issue,
                                type: this.getDependencyType(dependencyTaskBar.issue, issue)
                            });
                        }
                    }
                });
            }
        });

        return paths;
    }

    /**
     * Calculate the SVG path for a dependency line
     *
     * @method calculateDependencyPath
     * @param {Object} fromTaskBar Source task bar
     * @param {Object} toTaskBar Target task bar
     * @return {Object} Path object with SVG path string and coordinates
     */
    @action
    calculateDependencyPath(fromTaskBar, toTaskBar) {
        const rowHeight = 40;
        const taskBarHeight = 24;
        const arrowSize = 6;
        
        // Calculate start point (end of source task)
        const startX = fromTaskBar.leftOffset + fromTaskBar.width;
        const startY = (fromTaskBar.rowIndex * rowHeight) + (rowHeight / 2);
        
        // Calculate end point (start of target task)
        const endX = toTaskBar.leftOffset;
        const endY = (toTaskBar.rowIndex * rowHeight) + (rowHeight / 2);
        
        // Don't draw if tasks overlap or are too close
        if (endX <= startX + 10) {
            return null;
        }
        
        // Calculate control points for curved line
        const midX = startX + (endX - startX) / 2;
        const controlPoint1X = midX;
        const controlPoint1Y = startY;
        const controlPoint2X = midX;
        const controlPoint2Y = endY;
        
        // Create SVG path string
        let pathString = '';
        
        if (Math.abs(startY - endY) < 5) {
            // Straight horizontal line for same row
            pathString = `M ${startX} ${startY} L ${endX - arrowSize} ${endY}`;
        } else {
            // Curved line for different rows
            pathString = `M ${startX} ${startY} 
                         C ${controlPoint1X} ${controlPoint1Y} 
                           ${controlPoint2X} ${controlPoint2Y} 
                           ${endX - arrowSize} ${endY}`;
        }
        
        // Add arrow head
        const arrowPath = `M ${endX - arrowSize} ${endY - arrowSize/2} 
                          L ${endX} ${endY} 
                          L ${endX - arrowSize} ${endY + arrowSize/2}`;
        
        return {
            pathString,
            arrowPath,
            startX,
            startY,
            endX,
            endY,
            length: Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        };
    }

    /**
     * Determine the type of dependency relationship
     *
     * @method getDependencyType
     * @param {Object} fromIssue Source issue
     * @param {Object} toIssue Target issue
     * @return {String} Dependency type
     */
    @action
    getDependencyType(fromIssue, toIssue) {
        // In a full implementation, this would analyze the relationship
        // For now, we'll assume finish-to-start (most common)
        return 'finish-to-start';
    }

    /**
     * Get the SVG viewBox dimensions
     *
     * @method get svgViewBox
     * @return {String} SVG viewBox attribute value
     */
    get svgViewBox() {
        const width = this.args.totalWidth || 1000;
        const height = this.args.totalHeight || 400;
        
        return `0 0 ${width} ${height}`;
    }

    /**
     * Get CSS classes for a dependency path
     *
     * @method getPathClasses
     * @param {Object} path The dependency path object
     * @return {String} CSS classes
     */
    @action
    getPathClasses(path) {
        const classes = ['gantt-dependency'];
        
        // Add type class
        classes.push(`gantt-dependency--${path.type}`);
        
        // Add priority class based on target issue
        if (path.toIssue.priority) {
            classes.push(`gantt-dependency--${path.toIssue.priority}-priority`);
        }
        
        // Add critical path class if applicable
        if (this.isCriticalPath(path)) {
            classes.push('gantt-dependency--critical');
        }
        
        return classes.join(' ');
    }

    /**
     * Check if a dependency is part of the critical path
     *
     * @method isCriticalPath
     * @param {Object} path The dependency path object
     * @return {Boolean} Whether the dependency is critical
     */
    @action
    isCriticalPath(path) {
        // In a full implementation, this would check against calculated critical path
        // For now, we'll use a simple heuristic
        return path.toIssue.priority === 'high' && path.length > 100;
    }

    /**
     * Get style object for a dependency path
     *
     * @method getPathStyle
     * @param {Object} path The dependency path object
     * @return {Object} Style object
     */
    @action
    getPathStyle(path) {
        const baseStyle = {
            stroke: '#666',
            strokeWidth: 2,
            fill: 'none',
            markerEnd: 'url(#arrowhead)'
        };
        
        // Customize based on dependency type and priority
        if (path.type === 'finish-to-start') {
            baseStyle.strokeDasharray = 'none';
        } else if (path.type === 'start-to-start') {
            baseStyle.strokeDasharray = '5,5';
        }
        
        // Critical path styling
        if (this.isCriticalPath(path)) {
            baseStyle.stroke = '#e74c3c';
            baseStyle.strokeWidth = 3;
        }
        
        // Priority-based coloring
        if (path.toIssue.priority === 'high') {
            baseStyle.stroke = '#e74c3c';
        } else if (path.toIssue.priority === 'low') {
            baseStyle.stroke = '#95a5a6';
        }
        
        return baseStyle;
    }

    /**
     * Get arrow marker style
     *
     * @method get arrowMarkerStyle
     * @return {Object} Arrow marker style object
     */
    get arrowMarkerStyle() {
        return {
            fill: '#666',
            stroke: '#666'
        };
    }    
}
