/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import MD from "prometheus/utils/metadata/metadata";
import { hash } from 'rsvp';
import _ from 'lodash';

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
    afterModel()
    {
        Logger.debug('Prometheus.Routes.Index::afterModel');
        let _self = this;

        let widgetSettings = _self._getWidgetSettings();
        let widgets = _.split(_self.get('currentUser.user.dashboard.widgets'),',');
        _self.set('availableWidgets', _.keys(widgetSettings));

        _.forEach(widgets,function(widget,idx){
            widgets[idx] = _.trim(widget);
        });

        _self.set('widgets', widgets);

        let Promises = {};

        _.forEach(widgets,function(widget){
            Promises[widget] = _self.store.query(widgetSettings[widget].model,widgetSettings[widget].options)
        });

        Logger.debug(_self);
        Logger.debug(widgetSettings);
        Logger.debug(widgets);
        Logger.debug('-Prometheus.Routes.Index::afterModel');

        return hash(Promises).then(function(results){
            Logger.info(results);
            _.forEach(widgets,function(widget){
                _self.set(widget,results[widget]);
            });
        });
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
        let widgets = _self.get('widgets');
        controller.set('widgets',widgets);
        _.forEach(widgets,function(widget){
            controller.set(widget,_self.get(widget));
        });
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
        _.forEach(widgetSettings,function(widgetSetting,idx){
            let query = widgetSettings[idx].options.query;
            query = _.replace(query,'```ME```',_self.get('currentUser.user.id'));
            query = _.replace(query,'```TODAY_START```',luxon.DateTime.utc().startOf('day').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```TODAY_END```',luxon.DateTime.utc().endOf('day').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```WEEK_START```',luxon.DateTime.utc().startOf('week').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```WEEK_END```',luxon.DateTime.utc().endOf('week').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YEAR_START```',luxon.DateTime.utc().startOf('year').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YEAR_END```',luxon.DateTime.utc().endOf('year').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YESTERDAY_START```',luxon.DateTime.utc().plus(-1,'days').startOf('day').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```YESTERDAY_END```',luxon.DateTime.utc().plus(-1,'days').endOf('day').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```TOMORROW_START```',luxon.DateTime.utc().plus(1,'days').startOf('day').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```TOMORROW_END```',luxon.DateTime.utc().plus(1,'days').endOf('day').toFormat('YYYY-MM-DD HH:mm:ss'));
            query = _.replace(query,'```NOW```',luxon.DateTime.utc().toFormat('YYYY-MM-DD HH:mm:ss'));
            widgetSettings[idx].options.query = query;
            Logger.debug(query);
        });

        Logger.debug('-_getWidgetSettings');
        return widgetSettings;
    }

});