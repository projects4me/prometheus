/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import CreateWiki from "prometheus/controllers/app/project/wiki/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import _ from "lodash";
import $ from 'jquery';

/**
 * The controller for the wiki edit route, it is loaded when a user clicks on the
 * edit button on the wiki page
 * e.g. acme.projects4.me/app/1/wiki/edit/Home
 *
 * @class Edit
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Prometheus
 */
export default CreateWiki.extend(ProjectRelated, {

    /**
     * This is the layout name that is used to figure out what to
     * display
     *
     * @property layoutName
     * @for Create
     * @type String
     * @private
     */
    layoutName:'edit',

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
     * These are the actions that are handled by this controller
     *
     * @property actions
     * @type Object
     * @for Edit
     * @public
     */
    actions: {

        /**
         * This function is used to select the tags from the system
         *
         * @method tagSelected
         * @param {Object} e the list of selected items
         */
        tagSelected:function(e){
            Logger.debug('AppProjectWikiEditController:tagSelected');
            let _self = this;

            // If a tag was removed then remove it
            let removedTag = _.difference(this.selectedTags,e);

            if (removedTag[0] !== undefined)
            {
                _self.send('removeTag',removedTag[0],e);
            }

            // If a tag was selected then associate it with the wiki
            let selectedTag = _.difference(e,this.selectedTags);
            if (selectedTag[0] !== undefined)
            {
                // Save the relationship and then show the message to the user
                _self.get('store').createRecord('tagged',{
                    tagId : selectedTag[0].value,
                    relatedId : _self.get('model').get('id'),
                    relatedTo: "wiki"
                }).save().then(function(tagRel){
                    _self.get('model.tagged').pushObject(tagRel);
                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.wiki.tag.associated",{name:selectedTag[0].label}),
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

            let _self = this;
            let selectedTags = this.selectedTags;

            // Initialize the tag record
            let newTag = _self.get('newTag');
            newTag.validate().then(({ validations }) => {

                if (validations.get('isValid')) {
                    // Save it
                    newTag.save().then(function(tag){

                        // Then save the relationship
                        let tagged = _self.get('store').createRecord('tagged',{
                            tagId : tag.get('id'),
                            relatedId : _self.get('model').get('id'),
                            relatedTo: "wiki"
                        });

                        tagged.save().then(function(tagRel){
                            // After it has been saved then show the message to the user
                            new Messenger().post({
                                message: _self.get('i18n').t("views.app.wiki.tag.created",{name:tag.get('tag')}),
                                type: 'success',
                                showCloseButton: true
                            });

                            selectedTags = _.concat(selectedTags,{label:tag.get('tag'),value:tag.get('id')});
                            _self.get('model.tagged').pushObject(tagRel);
                            // set the values
                            _self.set('selectedTags',selectedTags);
                            _self.set('newTag', _self.get('store').createRecord('tag',{}));

                            // Remove the modal
                            $('.modal').modal('hide');
                            _self.set('addTagDialog',false);
                        });
                    });

                } else {
                    let messages = _self._buildMessages(validations,'tag');

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
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

            let _self = this;
            let tagged = _self.get('model').get('tagged').filterBy('tagId',tag.value)[0];

            // Delete the record
            tagged.deleteRecord();
            tagged.save().then(function(){

                // Display the message
                new Messenger().post({
                    message: _self.get('i18n').t("views.app.wiki.tag.removed",{name:tag.label}),
                    type: 'success',
                    showCloseButton: true
                });

                //  Update the selected tags
                _self.set('selectedTags',list);
                Logger.debug(_self.get('selectedTags'));
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
            $('.modal').modal('hide');
        }
    },

    /**
     * This function navigates a use to the wiki page
     *
     * @method afterCancel
     * @param model
     * @protected
     */
    afterCancel(model){
        let projectId = this.target.currentState.routerJsState.params["app.project"].project_id;
        model.rollbackAttributes();
        this.transitionToRoute('app.project.wiki.page', {
            project_id:projectId,
            wiki_name:model.get('name')
        });
    },

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model){
        return (_.size(model.changedAttributes()) > 0);
    },

});