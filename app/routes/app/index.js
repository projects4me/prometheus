/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import MD from "prometheus/utils/metadata/metadata";
import _ from 'lodash';
import { get } from '@ember/object';
import * as dates from 'prometheus/utils/date';
import { service } from '@ember/service';

const UTC = { zone: 'UTC' };
const stamp = (date) => dates.format(date, 'YYYY-MM-DD HH:mm:ss', UTC);

const STATUSES_ITEM = 'system-issuestatuses';

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
export default class AppIndexRoute extends App {

    /**
     * These are the widgets that the current user has on the
     * dashboard
     *
     * @property widgets
     * @type Array
     * @for Index
     * @public
     */
    widgets = null;

    /**
     * These are the widgets that are available in the system
     *
     * @property availableWidgets
     * @type Array
     * @for Index
     * @public
     */
    availableWidgets = null;

    /**
     * Batches the issue statuses and the widgets' first loads into one bulk request.
     *
     * @property bulk
     * @type Ember.Service
     * @private
     */
    @service bulk;

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
        _self.availableWidgets = _.keys(widgetSettings);
        let widgets = _self._getValidWidgets(widgetSettings);

        _self.widgets = widgets;

        // One bulk request for the issue statuses and the first load of every visible widget
        // that declares one (model + options in views.Dashboard.widgets.<name>)
        let loading = _.filter(widgets, (widget) => _self._declaresLoad(widgetSettings[widget]));
        let results = await _self.bulk.query([
            { id: STATUSES_ITEM, modelName: 'issuestatus', query: { query: `(Issuestatus.system : 1)`, limit: -1 } },
            ...loading.map((widget) => ({
                id: widget,
                modelName: widgetSettings[widget].model,
                query: widgetSettings[widget].options
            }))
        ]);

        // The statuses only colour the labels, so a failed load is not reported (as before)
        let widgetResults = {};
        for (let widget of widgets) {
            let result = results[widget];
            if (result?.error) {
                _self.errorManager.handleLoadError(result.error);
            }
            // A widget without a declaration loads itself; a failed item renders empty
            widgetResults[widget] = result ? (result.records ?? []) : undefined;
        }

        _self.widgetSettings = widgetSettings;
        _self.widgets = widgetResults;
        Logger.debug('-Prometheus.Routes.Index::afterModel');
    }

    /**
     * Whether a widget registers its first load with the dashboard, by declaring
     * the model and options of the query in its metadata.
     *
     * @method _declaresLoad
     * @param {Object} widgetSetting
     * @return {Boolean}
     * @private
     */
    _declaresLoad(widgetSetting){
        return Boolean(widgetSetting?.model && widgetSetting?.options);
    }

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
        let configured = _.split(get(this, 'currentUser.user.dashboard.widgets') || '', ',');
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
    }

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
    }

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
            if (!_.isString(widgetSetting.options?.query)) {
                return;
            }
            let query = widgetSettings[idx].options.query;
            query = _.replace(query,'```ME```',_self.get('currentUser.user.id'));
            query = _.replace(query,'```TODAY_START```',stamp(dates.startOf(dates.now(), 'day', UTC)));
            query = _.replace(query,'```TODAY_END```',stamp(dates.endOf(dates.now(), 'day', UTC)));
            query = _.replace(query,'```WEEK_START```',stamp(dates.startOf(dates.now(), 'week', UTC)));
            query = _.replace(query,'```WEEK_END```',stamp(dates.endOf(dates.now(), 'week', UTC)));
            query = _.replace(query,'```YEAR_START```',stamp(dates.startOf(dates.now(), 'year', UTC)));
            query = _.replace(query,'```YEAR_END```',stamp(dates.endOf(dates.now(), 'year', UTC)));
            query = _.replace(query,'```YESTERDAY_START```',stamp(dates.startOf(dates.add(dates.now(), -1, 'days', UTC), 'day', UTC)));
            query = _.replace(query,'```YESTERDAY_END```',stamp(dates.endOf(dates.add(dates.now(), -1, 'days', UTC), 'day', UTC)));
            query = _.replace(query,'```TOMORROW_START```',stamp(dates.startOf(dates.add(dates.now(), 1, 'days', UTC), 'day', UTC)));
            query = _.replace(query,'```TOMORROW_END```',stamp(dates.endOf(dates.add(dates.now(), 1, 'days', UTC), 'day', UTC)));
            query = _.replace(query,'```NOW```',stamp(dates.now()));
            query = _.replace(query,'```MY_PROJECTS```',_self.getProjectIds(LoadingAssetsController.get('projects')));
            widgetSettings[idx].options.query = query;
            Logger.debug(query);
        });

        Logger.debug('-_getWidgetSettings');
        return widgetSettings;
    }

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
}
