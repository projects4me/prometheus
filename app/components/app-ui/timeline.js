/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render all activities performed on modules
 * e.g project is created.
 * @class Timeline
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiTimelineComponent extends Component {
	/**
	 * This function returns the activities list. We are using dataKey to get the activities list
	 * from the activities object. dataKey is optional and is used to get the activities list from
	 * the activities object. If dataKey is not provided, the activities object will be returned.
	 * The activities rendered in issue & project modules are inside 'data' key. So 'data' is passed
	 * as key to the component to get the activities list.
	 *
	 * @method activitiesList
	 * @public
	 */
	get activitiesList() {
		let { activities, dataKey } = this.args;
		let result = {};
		Object.entries(activities).forEach(([key, activityCont]) => {
			result[key] =
				dataKey && activityCont[dataKey]
					? activityCont[dataKey]
					: activityCont;
		});
		return result;
	}

	/**
	 * This function returns the activities count.
	 *
	 * @method activitiesCount
	 * @public
	 */
	get activitiesCount() {
		return Object.keys(this.activitiesList).length;
	}
}
