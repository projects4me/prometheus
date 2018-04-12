/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
import $ from 'jquery';

/**
 * The controller for the wiki edit route, it is loaded when a user clicks on the
 * edit button on the wiki page
 * e.g. acme.projects4.me/app/1/wiki/edit/Home
 *
 * @class Edit
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Ember.Controller
 * @todo Minimize the code
 */
export default Controller.extend({

    /**
     * This is the store service which is used to interact with the data API
     *
     * @property store
     * @type Service
     * @for Edit
     * @private
     */
    store: inject(),

    /**
     * This flag is used to show or hide the modal dialog box for adding new tags
     *
     * @property addTagDialog
     * @type bool
     * @for Edit
     * @private
     */
    addTagDialog: false,

    /**
     * This flag is used to enable and disable the save button
     *
     * @property saveDisabled
     * @type String
     * @for Edit
     * @private
     */
    saveDisabled: 'true',

    /**
     * This is the controller of the project, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property projectController
     * @type Prometheus.Controllers.App.Project
     * @for Edit
     * @public
     */
    projectController: injectController('app.project'),

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for Edit
     * @private
     */
    issuesList: computed('projectController.issuesList', function(){
        return this.get('projectController').get('issuesList');
    }),

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Edit
     * @public
     */
    appController: injectController('app'),

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Edit
     * @private
     */
    usersList: computed('appController.usersList', function(){
        return this.get('appController').get('usersList');
    }),


    /**
     * These are the actions that are handled by this controller
     *
     * @property actions
     * @type Object
     * @for Edit
     * @public
     */
    actions: {

        /**
         * This function is responsible for saving the model. After successfully
         * saving the function takes the user to the saved page.
         *
         * @method save
         * @public
         * @todo Trigger the notificaiton
         */
        save:function() {
            var self = this;
            var model = this.get('model').objectAt(0);
            var changedAttributes = model.changedAttributes();
            var changed = false;
            for (var key in changedAttributes) {
                Logger.debug(key);
                changed = true;
            }
            Logger.debug(changed);
            if (changed){
                model.save().then(function(data){
                    Logger.debug(data);

                    if (changedAttributes['parentId'] !== undefined)
                    {
                        self.send('refreshWiki');
                    }
                    else if (changedAttributes['name'] !== undefined)
                    {
                        self.send('modelUpdated', data);
                    }

                    new Messenger().post({
                        message: self.get('i18n').t("views.app.wiki.created",{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });

                    self.transitionToRoute('app.project.wiki.page', {project_id:data.get('projectId'),wiki_name:data.get('name')});
                });
            }
        },

        /**
         * This function lets a user traverse to the main page of the project
         *
         * @method cancel
         * @public
         * @todo Trigger the notificaiton
         */
        cancel:function(){
            let model = this.get('model').objectAt(0);
            this.transitionToRoute('app.project.wiki.page', {project_id:model.get('projectId'),wiki_name:model.get('name')});
        },


        /**
         * The function enables the save button
         *
         * @method changed
         * @public
         * @todo Trigger the notificaiton
         */
        changed:function(){
            Logger.debug("AppProjectWikiEditController::changed()");
            Logger.debug("Something was updated");

            let self = this;
            Logger.debug(self);

            let model = this.get('model').objectAt(0);
            // if (typeof(data) === 'object' && data.markUp !== undefined)
            // {
            //     Logger.debug(model);
            //     model._internalModel._attributes['markUp'] = data.markUp;
            //     model.set('markUp',data.markUp);
            // }

            let changedAttributes = model.changedAttributes();
            let changed = false;
            for (var key in changedAttributes) {
                Logger.debug(key);
                changed = true;
            }
            this.set('saveDisabled',null);

            if (changed)
            {
                this.set('saveDisabled',null);
            }
            else {
                this.set('saveDisabled',true);
            }
        },

        /**
         * This function sets the wikiId as the parent
         *
         * @method wikiChanged
         * @param {Object} target
         * @public
         */
        wikiChanged:function(target){
            var model = this.get('model').objectAt(0);
            this.set('parentId',target.value);
            model.set('parentId',target.value);
            model.set('parentName',target.label);
            this.send('changed');
        },

        /**
         * This is the action that is called by summernote
         * A separate action is created as we are trying to follow
         * the data down action up approach
         *
         * @method onContentChange
         * @param contents
         * @private
         */
        onContentChange:function (contents) {
            Logger.debug('Prometheus.App.Project.Wiki.onContentChange');
            let self = this;
            //let model = self.get(model)
            self.get('model').objectAt(0).set('markUp',contents);
            //model._internalModel._attributes['markUp'] = data.markUp;
            self.send('changed');
            -Logger.debug('Prometheus.App.Project.Wiki.onContentChange');
        },

        /**
         * This function is used to select the tags from the system
         *
         * @method tagSelected
         * @param {Object} e the list of selected items
         */
        tagSelected:function(e){
            Logger.debug('AppProjectWikiEditController:tagSelected');
            Logger.debug(e);

            var self = this;

            // If a tag was removed then remove it
            var removedTag = _.difference(this.get('selectedTags'),e);
            Logger.debug('tag to be removed');
            Logger.debug(removedTag);

            if (removedTag[0] !== undefined)
            {
                this.send('removeTag',removedTag[0],e);
            }

            // If a tag was selected then associate it with the wiki
            var selectedTag = _.difference(e,this.get('selectedTags'));
            Logger.debug('tag that was selected');
            Logger.debug(selectedTag);
            if (selectedTag[0] !== undefined)
            {
                // Save the relationship and then show the message to the user
                self.get('store').createRecord('tagged',{
                    tagId : selectedTag[0].value,
                    relatedId : self.get('model').objectAt(0).get('id'),
                    relatedTo: "wiki"
                }).save().then(function(){
                    new Messenger().post({
                        message: self.get('i18n').t("views.app.wiki.tag.associated",{name:selectedTag[0].label}),
                        type: 'success',
                        showCloseButton: true
                    });
                });
                this.set('selectedTags',e);
            }
        },

        /**
         * This function is used to add a new tag in the system
         *
         * @method addTag
         * @todo Load the current info within the API
         */
        addTag:function(){
            Logger.debug('AppProjectWikiEditController:addTag');
            Logger.debug(this.get('tagName'));

            var self = this;
            var selectedTags = this.get('selectedTags');
            Logger.debug(this.get('selectedTags'));

            // Initialize the tag record
            var newTag = this.get('store').createRecord('tag',{
                deleted:0,
                tag:this.get('tagName'),
            });

            // Save it
            newTag.save().then(function(tag){

                // Then save the relationship
                var tagged = self.get('store').createRecord('tagged',{
                    tagId : tag.get('id'),
                    relatedId : self.get('model').objectAt(0).get('id'),
                    relatedTo: "wiki"
                });

                tagged.save().then(function(){
                    // After it has been saved then show the message to the user
                    new Messenger().post({
                        message: self.get('i18n').t("views.app.wiki.tag.created",{name:tag.get('tag')}),
                        type: 'success',
                        showCloseButton: true
                    });

                    selectedTags = _.concat(selectedTags,{label:tag.get('tag'),value:tag.get('id')});

                    // set the values
                    self.set('selectedTags',selectedTags);
                    self.set('tagName','');

                    // Remove the modal
                    $('.modal').modal('hide');
                    self.set('addTagDialog',false);

                    Logger.debug(selectedTags);
                });
            });
        },

        /**
         * This function is used to remove a tag from current wiki
         *
         * @method removeTag
         * @param {Object} tag The tag that needs to be removed
         * @param {Object} list The list of the tags that are currently set
         */
        removeTag:function(tag,list){
            Logger.debug('AppProjectWikiEditController:removeTag');
            Logger.debug(tag);
            Logger.debug(this.get('selectedTags'));
            Logger.debug(list);

            var self = this;
            var tagged = self.get('model').objectAt(0).get('tagged').filterBy('tagId',tag.value)[0];

            // Delete the record
            tagged.deleteRecord();
            tagged.save().then(function(){

                // Display the message
                new Messenger().post({
                    message: self.get('i18n').t("views.app.wiki.tag.removed",{name:tag.label}),
                    type: 'success',
                    showCloseButton: true
                });

                //  Update the selected tags
                self.set('selectedTags',list);
                Logger.debug(self.get('selectedTags'));
            });
        },

        /**
         * This function is used to show the add modal dialog box
         *
         * @method showDialog
         * @public
         */
        showDialog:function()
        {
            this.set('addTagDialog',true);
        },

        /**
         * This function is used to hide the add tag modal
         *
         * @method removeModal
         * @public
         */
        removeModal:function(){
            this.set('addTagDialog',false);
        }

    }

});