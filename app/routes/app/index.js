/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../app";
import Ember from "ember";
import MD from "../../utils/metadata/metadata";

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
     * @method afterMode;
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

        return Ember.RSVP.hash(Promises).then(function(results){
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
        let i18n = _self.get('i18n');
        let widgetSettings = MD.create().getViewMeta('Dashboard','widgets',i18n);

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
            widgetSettings[idx].options.query = query;
            Logger.debug(query);
        });

        Logger.debug('-_getWidgetSettings');
        return widgetSettings;
    }

});