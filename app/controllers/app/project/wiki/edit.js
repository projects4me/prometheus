/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppProjectWikiCreateController from "prometheus/controllers/app/project/wiki/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import _ from "lodash";
import $ from 'jquery';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';

/**
 * The controller for the wiki edit route, it is loaded when a user clicks on the
 * edit button on the wiki page
 * e.g. acme.projects4.me/app/1/wiki/edit/Home
 *
 * @class AppProjectWikiEditController
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Prometheus
 */
export default class AppProjectWikiEditController extends AppProjectWikiCreateController.extend(ProjectRelated) {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppProjectWikiEditController
     * @private
     */
    metadata = {
        sections: [
            {
                name: "tagCreate",
                fields: [
                    {
                        name: "tag",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }

    /**
     * This function is called on the initialization of the controller. In this function
     * we're calling setupSchema method in order to generate schema, by analyzing metadata
     * defined in the controller, that will be used to validate the form of the template.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * This is the layout name that is used to figure out what to
     * display
     *
     * @property layoutName
     * @for Create
     * @type String
     * @private
     */
    layoutName = 'edit';

    /**
     * This flag is used to show or hide the modal dialog box for adding new tags
     *
     * @property addTagDialog
     * @type bool
     * @for Edit
     * @private
     */
    addTagDialog = false;

    /**
     * This function is used to select the tags from the system
     *
     * @method tagSelected
     * @param {Object} e the list of selected items
     */
    @action tagSelected(e) {
        Logger.debug('AppProjectWikiEditController:tagSelected');
        let _self = this;

        // If a tag was removed then remove it
        let removedTag = _.difference(this.selectedTags, e);

        if (removedTag[0] !== undefined) {
            _self.send('removeTag', removedTag[0], e);
        }

        // If a tag was selected then associate it with the wiki
        let selectedTag = _.difference(e, this.selectedTags);
        if (selectedTag[0] !== undefined) {
            // Save the relationship and then show the message to the user
            _self.get('store').createRecord('tagged', {
                tagId: selectedTag[0].value,
                relatedId: _self.get('model').get('id'),
                relatedTo: "wiki"
            }).save().then(function (tagRel) {
                _self.get('model.tagged').pushObject(tagRel);
                new Messenger().post({
                    message: htmlSafe(_self.intl.t("views.app.wiki.tag.associated", { name: selectedTag[0].label })),
                    type: 'success',
                    showCloseButton: true
                });
            });
            this.set('selectedTags', e);
        }
    }

    /**
     * This function is used to add a new tag in the system
     *
     * @method addTag
     * @todo Load the current info within the API
     */
    @action addTag() {
        Logger.debug('AppProjectWikiEditController:addTag');

        let _self = this;
        let selectedTags = this.selectedTags;

        // Initialize the tag record
        let newTag = _self.get('newTag');
        this.validate(newTag, 'tagCreate').then((validation) => {

            if (validation.isValid) {
                // Save it
                newTag.save().then(function (tag) {

                    // Then save the relationship
                    let tagged = _self.get('store').createRecord('tagged', {
                        tagId: tag.get('id'),
                        relatedId: _self.get('model').get('id'),
                        relatedTo: "wiki"
                    });

                    tagged.save().then(function (tagRel) {
                        // After it has been saved then show the message to the user
                        new Messenger().post({
                            message: htmlSafe(_self.intl.t("views.app.wiki.tag.created", { name: tag.get('tag') })),
                            type: 'success',
                            showCloseButton: true
                        });

                        selectedTags = _.concat(selectedTags, { label: tag.get('tag'), value: tag.get('id') });
                        _self.get('model.tagged').pushObject(tagRel);
                        // set the values
                        _self.set('selectedTags', selectedTags);
                        _self.set('newTag', _self.get('store').createRecord('tag', {}));

                        // Remove the modal
                        $('.modal').modal('hide');
                        _self.set('addTagDialog', false);
                    });
                });

            } else {
                let messages = _self._buildMessages(validation.errors, 'tag');

                new Messenger().post({
                    message: messages,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
    }

    /**
     * This function is used to remove a tag from current wiki
     *
     * @method removeTag
     * @param {Object} tag The tag that needs to be removed
     * @param {Object} list The list of the tags that are currently set
     */
    @action removeTag(tag, list) {
        Logger.debug('AppProjectWikiEditController:removeTag');

        let _self = this;
        let tagged = _self.get('model').get('tagged').filterBy('tagId', tag.value)[0];

        // Delete the record
        tagged.deleteRecord();
        tagged.save().then(function () {

            // Display the message
            new Messenger().post({
                message: htmlSafe(_self.intl.t("views.app.wiki.tag.removed", { name: tag.label })),
                type: 'success',
                showCloseButton: true
            });

            //  Update the selected tags
            _self.set('selectedTags', list);
            Logger.debug(_self.get('selectedTags'));
        });
    }

    /**
     * This function is used to show the add modal dialog box
     *
     * @method showDialog
     * @public
     */
    @action showDialog() {
        this.set('addTagDialog', true);
    }

    /**
     * This function is used to hide the add tag modal
     *
     * @method removeModal
     * @public
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('addTagDialog', false);
        $('.modal').modal('hide');
    }


    /**
     * This function navigates a use to the wiki page
     *
     * @method afterCancel
     * @param model
     * @protected
     */
    afterCancel(model) {
        model.rollbackAttributes();
        this.transitionToRoute('app.project.wiki.page', {
            shortcode: this.trackedProject.shortCode,
            wiki_name: model.get('name')
        });
    }

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model) {
        return (_.size(model.changedAttributes()) > 0);
    }
}