/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import MD from "prometheus/utils/metadata/metadata";
import _ from 'lodash';

const DEFAULT_WIDGETS = ['recentIssues', 'activeMilestones', 'weeklyActivities', 'weeklyIssueTimelogs', 'weeklyConversations'];

/**
 * The dashboard
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App
 * @extends AppRoute
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * These are the widgets that the current user has on the
     * dashboard
     *
     * @property widgets
     * @type Array
     * @for Index
     * @public
     */
    widgets: null,

    /**
     * These are the widgets that are available in the system
     *
     * @property availableWidgets
     * @type Array
     * @for Index
     * @public
     */
    availableWidgets: null,

    /**
     * This function is called by ember when the model has been
     * loaded, we are using this function to return promises
     * for the data for each of the widgets to be displayed
     *
     * @method afterModel;
     * @protected
     */
    async model()
    {
        Logger.debug('Prometheus.Routes.Index::afterModel');
        let _self = this;

        let widgetSettings = _self._getWidgetSettings();
        _self.set('availableWidgets', _.keys(widgetSettings));
        let widgets = _self._getValidWidgets(widgetSettings);

        _self.set('widgets', widgets);

        let widgetResults = {};

        //Load the issue statuses so the status labels of the widgets can use their configured colours
        await _self.store.query('issuestatus', { query: `(Issuestatus.system : 1)`, limit: -1 }).catch(() => []);

        for (let widget of widgets) {
            widgetResults[widget] = await _self.store.query(widgetSettings[widget].model,widgetSettings[widget].options)
        }
        _self.set('widgetSettings', widgetSettings);
        Logger.debug(_self);
        Logger.debug(widgetSettings);
        Logger.debug(widgets);
        Logger.debug('-Prometheus.Routes.Index::afterModel');

        try {
            _self.set('widgets', widgetResults);
        } catch (error) {
            _self.errorManager.handleError(error);
        }
    },

    /**
     * Returns the dashboard widgets of the current user, without blank or
     * unknown names. Falls back to the default widgets when none are left.
     *
     * @method _getValidWidgets
     * @param {Object} widgetSettings
     * @return {Array}
     * @private
     */
    _getValidWidgets(widgetSettings){
        let configured = _.split(this.get('currentUser.user.dashboard.widgets') || '', ',');
        let widgets = _.filter(_.map(configured, _.trim), function(widget){
            if (widget === '' || !_.has(widgetSettings, [widget])) {
                if (widget !== '') {
                    Logger.debug('Dropping unknown dashboard widget: ' + widget);
                }
                return false;
            }
            return true;
        });
        if (widgets.length === 0) {
            widgets = _.filter(DEFAULT_WIDGETS, function(widget){ return _.has(widgetSettings, widget); });
        }
        return widgets;
    },

    /**
     * This function is called when the route needs to setup the
     * controller
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Index} controller
     * @protected
     */
    setupController(controller){
        let _self = this;
        controller.set('widgets',_self.widgets);
        controller.set('widgetSettings',_self.widgetSettings);
    },

    /**
     * This function is used to return the widget settings available
     * in the system
     *
     * @method _getWidgetSettings
     * @return {*|Object}
     * @private
     */
    _getWidgetSettings(){
        Logger.debug('_getWidgetSettings');
        let _self = this;
        let intl = _self.intl;
        let widgetSettings = MD.create().getViewMeta('Dashboard','widgets',intl);
        let LoadingAssetsController = _self.controllerFor('app.loading-assets');

        _.forEach(widgetSettings,function(widgetSetting,idx){
            let query = widgetSettings[idx].options.query;
            query = _.replace(query,'```ME```',_self.get('currentUser.user.id'));
            query = _.replace(query,'```TODAY_START```',moment.utc().startOf('day').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```TODAY_END```',moment.utc().endOf('day').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```WEEK_START```',moment.utc().startOf('week').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```WEEK_END```',moment.utc().endOf('week').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YEAR_START```',moment.utc().startOf('year').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YEAR_END```',moment.utc().endOf('year').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YESTERDAY_START```',moment.utc().add(-1,'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YESTERDAY_END```',moment.utc().add(-1,'days').endOf('day').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```TOMORROW_START```',moment.utc().add(1,'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```TOMORROW_END```',moment.utc().add(1,'days').endOf('day').format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```NOW```',moment.utc().format('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```MY_PROJECTS```',_self.getProjectIds(LoadingAssetsController.get('projects')));
            widgetSettings[idx].options.query = query;
            Logger.debug(query);
        });

        Logger.debug('-_getWidgetSettings');
        return widgetSettings;
    },

    /**
     * Prepare comma separated project ids from the provided projects array.
     *
     * @method getProjectIds
     * @param {Array} projects - The array of projects
     * @return {string} A comma-separated list of project IDs
     * @public
     */
    getProjectIds(projects) {
        let projectIds = '';
        projects.forEach(function(project){
            projectIds += `'${project.id}',`;
        });
        projectIds = projectIds.slice(0, -1);
        return projectIds;
    }
});