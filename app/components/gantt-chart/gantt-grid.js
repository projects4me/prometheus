import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class GanttChartGanttGridComponent extends Component {
	/**
	 * Get the CSS grid template columns for the background grid
	 *
	 * @method get gridTemplateColumns
	 * @return {String} CSS grid template columns value
	 */
	get gridTemplateColumns() {
		if (!this.args.columns) {
			return 'none';
		}

		return this.args.columns.map((column) => `${column.width}px`).join(' ');
	}

	/**
	 * Get the total width of the grid
	 *
	 * @method get totalWidth
	 * @return {Number} Total width in pixels
	 */
	get totalWidth() {
		if (!this.args.columns) {
			return 0;
		}

		return this.args.columns.reduce((sum, column) => sum + column.width, 0);
	}

	/**
	 * Get the total height of the grid based on number of tasks
	 *
	 * @method get totalHeight
	 * @return {Number} Total height in pixels
	 */
	get totalHeight() {
		const taskCount = this.args.taskCount || 0;
		const rowHeight = 40; // Default row height
		return taskCount * rowHeight;
	}

	/**
	 * Generate grid lines for visual separation
	 *
	 * @method get gridLines
	 * @return {Array} Array of grid line objects
	 */
	get gridLines() {
		const lines = [];

		if (!this.args.columns) {
			return lines;
		}

		let currentX = 0;

		// Vertical lines for date columns
		this.args.columns.forEach((column, index) => {
			lines.push({
				type: 'vertical',
				x: currentX,
				y: 0,
				height: this.totalHeight,
				isWeekend: this.isWeekend(column),
				isToday: this.isToday(column),
				isPast: this.isPast(column)
			});

			currentX += column.width;
		});

		// Add final vertical line
		lines.push({
			type: 'vertical',
			x: currentX,
			y: 0,
			height: this.totalHeight,
			isWeekend: false,
			isToday: false,
			isPast: false
		});

		// Horizontal lines for task rows
		const rowHeight = 40;
		const taskCount = this.args.taskCount || 0;

		for (let i = 0; i <= taskCount; i++) {
			lines.push({
				type: 'horizontal',
				x: 0,
				y: i * rowHeight,
				width: this.totalWidth,
				isAlternate: i % 2 === 1
			});
		}

		return lines;
	}

	/**
	 * Check if a column represents today
	 *
	 * @method isToday
	 * @param {Object} column The timeline column
	 * @return {Boolean} Whether the column is today
	 */
	@action
	isToday(column) {
		const today = new Date();
		const columnDate = new Date(column.date);

		return today.toDateString() === columnDate.toDateString();
	}

	/**
	 * Check if a column is in the past
	 *
	 * @method isPast
	 * @param {Object} column The timeline column
	 * @return {Boolean} Whether the column is in the past
	 */
	@action
	isPast(column) {
		const today = new Date();
		const columnDate = new Date(column.date);

		return columnDate < today;
	}

	/**
	 * Check if a column is a weekend (Saturday or Sunday)
	 *
	 * @method isWeekend
	 * @param {Object} column The timeline column
	 * @return {Boolean} Whether the column is a weekend
	 */
	@action
	isWeekend(column) {
		const columnDate = new Date(column.date);
		const dayOfWeek = columnDate.getDay();

		return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
	}

	/**
	 * Get CSS classes for a grid line
	 *
	 * @method getLineClasses
	 * @param {Object} line The grid line object
	 * @return {String} CSS classes
	 */
	@action
	getLineClasses(line) {
		const classes = ['gantt-grid__line', `gantt-grid__line--${line.type}`];

		if (line.type === 'vertical') {
			if (line.isToday) {
				classes.push('gantt-grid__line--today');
			}

			if (line.isPast) {
				classes.push('gantt-grid__line--past');
			}

			if (line.isWeekend) {
				classes.push('gantt-grid__line--weekend');
			}
		} else if (line.type === 'horizontal') {
			if (line.isAlternate) {
				classes.push('gantt-grid__line--alternate');
			}
		}

		return classes.join(' ');
	}

	/**
	 * Get style object for a grid line
	 *
	 * @method getLineStyle
	 * @param {Object} line The grid line object
	 * @return {Object} Style object
	 */
	@action
	getLineStyle(line) {
		if (line.type === 'vertical') {
			return {
				left: `${line.x}px`,
				top: `${line.y}px`,
				height: `${line.height}px`,
				width: '1px'
			};
		} else {
			return {
				left: `${line.x}px`,
				top: `${line.y}px`,
				width: `${line.width}px`,
				height: '1px'
			};
		}
	}
}
