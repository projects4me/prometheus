/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import List from "prometheus/controllers/prometheus/list";

/**
 * This controller is used for the project list
 *
 * @class Index
 * @namespace Prometheus.Controllers
 * @module App.Projects
 * @extends List
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default List.extend({

    /**
     * This property stores the field on which the page if currently sored on
     *
     * @property sort
     * @for Index
     * @type String
     * @private
     */
    sort: 'Project.dateModified',

    /**
     * The action handlers for the issue list view
     *
     * @property action
     * @for Index
     * @type Object
     * @public
     */
    actions:{

        /**
         * This function is used to navigate the user to the detail page
         * for the project
         *
         * @method openDetail
         * @param {Prometheus.Model.Project} project the project model to which we have to navigate to
         * @public
         */
        openDetail(project){
            Logger.debug("Prometheus.Controllers.Projects.Index::openDetail");
            this.transitionToRoute('app.project.index',{project_id:project.get('id')});
            Logger.debug("-Prometheus.Controllers.Projects.Index::openDetail");
        },

        /**
         * This function is used to help navigate to the create project page
         *
         * @method createProject
         * @public
         */
        createProject(){
            Logger.debug("Prometheus.Controllers.Projects.Index::createProject()");
            this.transitionToRoute('app.projects.create');
            Logger.debug("-Prometheus.Controllers.Projects.Index::createProject()");
        },

        /**
         * This function is used to save a search
         *
         * @method saveSearch
         * @public
         */
        saveSearch () {
            Logger.debug('Prometheus.Controllers.Projects.Index->openSaveSearch');
            let _self = this;
            _self.send('searchByRules');
            let query = _self.get('query');

            if (query !== null) {
                let _savedSearch = _self.get('newSavedsearch');
                _savedSearch.set('relatedTo','project');
                _savedSearch.set('searchquery',query);

                _savedSearch.save().then(function (data) {
                    _self.get('savedsearches').pushObject(data);
                    _self.set('newSavedsearch',{});

                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.project.list.savedsearch.added",{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });

                });
            } else  {

                new Messenger().post({
                    message: _self.get('i18n').t("views.app.project.list.savedsearch.missing"),
                    type: 'error',
                    showCloseButton: true
                });

            }

            _self.send('removeSaveSearchDialog');

            Logger.debug('-Prometheus.Controllers.Projects.Index->openSaveSearch');
        },

        /**
         * This function is used to copy a public saved search
         *
         * @method copySearch
         * @public
         */
        copySearch (search) {
            Logger.debug('Prometheus.Controllers.Projects.Index->copySearch');
            let _self = this;

            let _savedSearch = _self.get('newSavedsearch');
            _savedSearch.set('relatedTo','project');
            _savedSearch.set('searchquery',search.get('searchquery'));
            _savedSearch.set('name',search.get('name'));
            _savedSearch.set('public',0);

            _savedSearch.save().then(function (data) {
                _self.get('savedsearches').pushObject(data);
                let newSavedSearch = _self.get('store').createRecord('savedsearch');
                _self.set('newSavedsearch',newSavedSearch);

                new Messenger().post({
                    message: _self.get('i18n').t("views.app.project.list.savedsearch.copied",{name:data.get('name')}),
                    type: 'success',
                    showCloseButton: true
                });

            });

            Logger.debug('-Prometheus.Controllers.Projects.Index->copySearch');
        },

        /**
         * This function is used to delete a saved search
         *
         * @method deleteSearch
         * @public
         */
        deleteSearch(search) {
            Logger.debug('Prometheus.Controllers.Projects.Index->deleteSearch');
            let _self = this;
            let toBeDeleted = _self.get('savedsearches').findBy('id',search.get('id'));

            let deleting = new Messenger().post({
                message: _self.get('i18n').t("views.app.project.list.savedsearch.delete",{name:search.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: _self.get('i18n').t("views.app.project.list.savedsearch.confirmdelete").toString(),
                        action: function() {

                            // destroy the saved search
                            toBeDeleted.destroyRecord().then(function(){
                                // remove from the view by updating the model
                                _self.get('savedsearches').removeObject(toBeDeleted);

                                return deleting.update({
                                    message: _self.get('i18n').t("views.app.project.list.savedsearch.deleted",{name:search.get('name')}),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: _self.get('i18n').t("views.app.project.list.savedsearch.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: _self.get('i18n').t("views.app.project.list.savedsearch.deletecancel"),
                                type: 'success',
                                actions: false
                            });
                        }
                    },

                }
            });

            Logger.debug('-Prometheus.Controllers.Projects.Index->deleteSearch');
        },

    }

});
