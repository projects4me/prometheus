import Service from '@ember/service';
import { inject as service } from '@ember/service';

/**
 * This service provides the breadcrumb for a given route.
 *
 * @class BreadCrumbService
 * @namespace Prometheus.Services
 * @extends Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class BreadCrumbService extends Service {

	/**
     * Router service for route information
	 * 
	 * @property router
	 * @type Ember.Service
	 * @public
	 */
	@service router;

	/**
	 * Tracked project service
	 * 
	 * @property trackedProject
	 * @type Ember.Service
	 * @public
	 */
	@service trackedProject;

    /**
     * Intl service for translations
     * 
     * @property intl
     * @type Ember.Service
     * @public
     */
    @service intl;

	/**
	 * Route metadata mapping for automatic breadcrumb generation
	 *
	 * @property routeMetadata
	 * @type Object
	 * @private
	 */
	routeMetadata = {
		app: {
			title: 'views.nav.menu.dashboard.label',
			icon: 'dashboard',
			linkable: true
		},
		'app.projects.index': {
			title: 'global.module.plural.project',
			icon: 'briefcase',
			linkable: true
		},
		'app.projects.create': {
			title: 'views.nav.menu.project.create',
			icon: 'plus',
			linkable: true,
			parent: 'app.projects.index'
		},
		'app.project': {
			title: null, // Dynamic from route
			icon: 'briefcase',
			linkable: true,
			parent: 'app.projects.index'
		},
		'app.project.issue.index': {
			title: 'global.module.plural.issue',
			icon: 'tasks',
			linkable: true,
			parent: 'app.project'
		},
		'app.project.issue.create': {
			title: 'views.nav.menu.issue.create',
			icon: 'plus',
			linkable: true,
			parent: 'app.project.issue.index'
		},
		'app.project.issue.page': {
			title: null, // Dynamic from route
			icon: 'tasks',
			linkable: true,
			parent: 'app.project.issue.index'
		},
		'app.project.issue.edit': {
			title: 'views.nav.menu.issue.edit',
			icon: 'pencil',
			linkable: true,
			parent: 'app.project.issue.page'
		},
		'app.project.wiki.index': {
			title: 'views.nav.menu.wiki.label',
			icon: 'book',
			linkable: true,
			parent: 'app.project'
		},
		'app.project.wiki.create': {
			title: 'views.nav.menu.wiki.create',
			icon: 'plus',
			linkable: true,
			parent: 'app.project.wiki.index'
		},
		'app.project.wiki.page': {
			title: null, // Dynamic from route
			icon: 'book',
			linkable: true,
			parent: 'app.project.wiki.index'
		},
		'app.project.wiki.edit': {
			title: 'views.nav.menu.wiki.edit',
			icon: 'edit',
			linkable: true,
			parent: 'app.project.wiki.page'
		},
		'app.user.index': {
			title: 'global.module.plural.user',
			icon: 'user',
			linkable: true
		},
		'app.user.create': {
			title: 'views.nav.menu.user.create',
			icon: 'plus',
			linkable: true,
			parent: 'app.user.management'
		},
		'app.user.management': {
			title: 'views.nav.menu.user.management',
			icon: 'users',
			linkable: true,
			parent: 'app'
		},
		'app.user.page': {
			title: null, // Dynamic from route
			icon: 'user',
			linkable: true,
			parent: 'app'
		},
		'app.user.edit': {
			title: 'views.nav.menu.user.edit',
			icon: 'edit',
			linkable: true,
			parent: 'app.user.page'
		},
		'app.project.board': {
			title: 'views.nav.menu.board.label',
			icon: 'columns',
			linkable: true,
			parent: 'app.project'
		},
		'app.project.calendar': {
			title: 'views.nav.menu.calendar.label',
			icon: 'calendar',
			linkable: true,
			parent: 'app.project'
		},
		'app.project.conversation': {
			title: 'views.nav.menu.conversation.label',
			icon: 'comments',
			linkable: true,
			parent: 'app.project'
		},
		'app.role.index': {
			title: 'global.module.plural.role',
			icon: 'key',
			linkable: true,
			parent: 'app'
		},
		'app.role.page': {
			title: null, // Dynamic from route
			icon: 'key',
			linkable: true,
			parent: 'app.role.index'
		},
	};

	/**
	 * This function returns the breadcrumb for a given route.
	 *
	 * @param {String} route - The route to get the breadcrumb for
	 * @returns {Object} The breadcrumb object
	 */
	getBreadcrumb(route) {
		return this.routeMetadata[route];
	}

	/**
	 * Get route parameters for a given route
	 * For nested routes, includes parent route params
	 *
	 * @method getRouteParams
	 * @param {String} routeName - Route name
	 * @returns {Array} Array of route params
	 * @public
	 */
	getRouteParams(routeName) {
		const currentRoute = this.router.currentRoute;
		const params = [];

		if (currentRoute) {
			const routeInfo = currentRoute;

			// Handle project routes - always include shortcode for project-related routes
			if (
				routeName.includes('project') &&
				!routeName.includes('projects')
			) {
				if (this.trackedProject.shortCode) {
					params.push(this.trackedProject.shortCode);
				}
			}

			// Handle nested issue routes - need both shortcode (parent) and issue_number
			if (
				routeName.includes('issue.page') ||
				routeName.includes('issue.edit')
			) {
				// shortcode is already added above if it's a project route
				const issueNumber = routeInfo.params?.issue_number;
				if (issueNumber) {
					params.push(issueNumber);
				}
			}

			// Handle nested wiki routes - need both shortcode (parent) and wiki_name
			if (
				routeName.includes('wiki.page') ||
				routeName.includes('wiki.edit')
			) {
				// shortcode is already added above if it's a project route
				const wikiName = routeInfo.params?.wiki_name;
				if (wikiName) {
					params.push(wikiName);
				}
			}

			// Handle user routes - single param
			if (
				routeName.includes('user.page') ||
				routeName.includes('user.edit')
			) {
				const userId = routeInfo.params?.user_id;
				if (userId) {
					params.push(userId);
				}
			}
		}

		return params;
	}

	/**
	 * Create a breadcrumb item object
	 *
	 * @method createBreadcrumbItem
	 * @param {String} routeName - Route name
	 * @param {Object} config - Breadcrumb configuration
	 * @returns {Object|null} Breadcrumb item or null if should be skipped
	 * @public
	 */
	createBreadcrumbItem(routeName, config) {
		if (!config.title) {
			return null;
		}
		const routeParams = this.getRouteParams(routeName);
		
		let title = config.title;
		if (title && title.includes('.')) {
			try {
				title = this.intl.t(title);
			} catch (e) {
				console.error(`Error translating title for route ${routeName}: ${e}`);
			}
		}
		return {
			title,
			route: routeName,
			params: routeParams,
			icon: config.icon,
			linkable: config.linkable !== false,
			record: config.record || false
		};
	}

	setTitle(route, title) {
		this.routeMetadata[route].title = title;
	}

	setIcon(route, icon) {		
		this.routeMetadata[route].icon = icon;
	}
}
