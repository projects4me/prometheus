/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

/**
 * This route will be used if there is no route found for the requested URL.
 *
 * @class NotFoundRoute
 * @namespace Prometheus.Routes
 * @extends Route
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class NotFoundRoute extends Route {
	/**
	 * The router service provides access to route.
	 *
	 * @property router
	 * @type Ember.Service
	 * @for NotFoundRoute
	 * @public
	 */
	@service router;

	/**
	 * When user unintentionally tries to access a route by entering the path in case insensitive format e.g. /App, we will
	 * convert that path to the lowercase and redirect the user to the correct path (/app). If the route is not found
	 * then this class template will be rendered stating user that the "Page is not found".
	 *
	 * @method beforeModel
	 * @param {Transition} transition
	 * @public
	 */
	beforeModel(transition) {
		let url =
			this.router.location.concreteImplementation._previousURL.toLowerCase();
		this.router.transitionTo(url);
	}
}
