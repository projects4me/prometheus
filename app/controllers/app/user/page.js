/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import window from "ember-window-mock";
import { computed, action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";
import { fileToBase64 } from "prometheus/utils/image-to-base64";
import ENV from "prometheus/config/environment";
import { htmlSafe } from "@ember/template";

/**
 * This controller is used to manage the user detail/page view
 *
 * @class AppUserPageController
 * @namespace Prometheus.Controllers
 * @module App.Users
 * @extends Prometheus
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserPageController extends PrometheusCreateController {
    @service language;

    /**
     * Yup schema metadata for the inline-editable fields on the user page.
     * Each field corresponds to an attribute editable inline, with the same
     * validation rules that would apply on the create form.
     *
     * @property metadata
     * @type {Object}
     * @public
     */
    metadata = {
        sections: [
            {
                name: "userPage",
                fields: [
                    {
                        name: "name",
                        validations: {
                            default: {
                                type: "string",
                                rules: [{ name: "required" }],
                            },
                        },
                    },
                    {
                        name: "title",
                        validations: {
                            default: {
                                type: "string",
                                rules: [],
                            },
                        },
                    },
                    {
                        name: "dateOfBirth",
                        validations: {
                            default: {
                                type: "string",
                                rules: [{ name: "required" }],
                            },
                        },
                    },
                    {
                        name: "timezone",
                        validations: {
                            default: {
                                type: "string",
                                rules: [{ name: "required" }],
                            },
                        },
                    },
                ],
            },
        ],
    };

    /**
     * Builds the Yup schema from `metadata` so that `validateInlineField` can
     * be used for all inline-editable fields on this page.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * Holds the temporary data URL for selected image before crop apply.
     *
     * @property cropImageSrc
     * @type {String|null}
     * @public
     */
    @tracked cropImageSrc = null;

    /**
     * This function is triggered when user clicks on one of their social
     * links in order to redirect to their social profile. Here we have used 
     * mocked window object which will be used to in testing for the purpose
     * of redirection. Instead of redirecting user to their social links in testing,
     * we'll mock the open method of window object in testing to ignore redirection.
     * 
     *
     * @method redirectToSocialLink
     * @param {String} url url, that the user want to redirects to
     * @return void
     * @public
     */
    @action redirectToSocialLink(url) {
        Logger.debug("+Prometheus.Controllers.App.User.Page::redirectToSocialLink");
        window.open(url, "_blank");
        Logger.debug("-Prometheus.Controllers.App.User.Page::redirectToSocialLink");
    }

    /**
     * Success toast shown after `saveModelAttribute()` persists an inline edit.
     *
     * @method getSaveModelAttributeSuccessMessage
     * @param {Prometheus.Models.User} model
     * @return {SafeString}
     * @protected
     */
    getSaveModelAttributeSuccessMessage(model) {
        return htmlSafe(this.intl.t("views.app.user.updated", { name: model.name }));
    }

    /**
     * Human-friendly language label for display on the user page by using language service.
     *
     * @property userLanguageLabel
     * @type {String|null}
     * @public
     */
    get userLanguageLabel() {
        return this.language.getLanguageLabel(this.model.language);
    }

    /**
     * Human-friendly timezone label for display on the user page.
     *
     * @property userTimezoneLabel
     * @type {String|null}
     * @public
     */
    get userTimezoneLabel() {
        let zoneName = this.model.timezone;

        if (!zoneName) {
            return null;
        }

        try {
            let zone = moment.tz(zoneName);
            let abbr = zone.zoneAbbr();
            if (!Number.isNaN(Number(abbr))) {
                abbr = "GMT";
            }

            let offset = zone.utcOffset() ? zone.format("Z") : "";
            return `${zoneName} (${abbr}${offset})`;
        } catch {
            return zoneName;
        }
    }

    /**
     * Validates and reads selected profile picture file.
     *
     * @method uploadImage
     * @param {String} _imageElementClass
     * @param {Object} file
     * @public
     */
    @action
    async uploadImage(_imageElementClass, file) {
        const { maxFileSize, allowedTypes } = ENV.app.upload.profilePicture;

        if (!allowedTypes.includes(file.file.type)) {
            new Messenger().post({
                message: this.intl
                    .t("views.app.user.profilePicture.imageTypeError", {
                        types: allowedTypes.map((type) => type.split("/")[1]).join(", "),
                    })
                    .toString(),
                type: "error",
                showCloseButton: true,
                hideAfter: 3,
            });
            return;
        }

        if (file.file.size > maxFileSize) {
            new Messenger().post({
                message: this.intl
                    .t("views.app.user.profilePicture.imageSizeError", {
                        limit: `${maxFileSize / (1024 * 1024)}MB`,
                    })
                    .toString(),
                type: "error",
                showCloseButton: true,
                hideAfter: 3,
            });
            return;
        }

        this.cropImageSrc = await fileToBase64(file);
    }

    /**
     * Applies cropped image and persists it to the user model.
     *
     * @method applyCrop
     * @param {String} croppedBase64
     * @public
     */
    @action
    async applyCrop(croppedBase64) {
        let previousProfilePicture = this.model.profilePicture;
        this.model.profilePicture = croppedBase64;

        try {
            await this.model.save();
            new Messenger().post({
                message: htmlSafe(this.intl.t("views.app.user.profilePicture.updated")),
                type: "success",
                showCloseButton: true,
                hideAfter: 3,
            });
            this.cropImageSrc = null;
        } catch (error) {
            this.model.profilePicture = previousProfilePicture;
            this.errorManager.handleError(error, {
                moduleName: "user",
            });
            this.cropImageSrc = null;
        }
    }

    /**
     * Cancels cropper operation.
     *
     * @method cancelCrop
     * @public
     */
    @action
    cancelCrop() {
        this.cropImageSrc = null;
    }

    /**
    * Open Projects of the user.
    *
    * @property openProjects
    * @type ProjectModel
    * @for User
    * @private
    */
    @computed('model.projects')
    get openProjects() {
        return (this.model.projects.filter((project) => (project.done === "0"))).length;
    }

    /**
    * Closed Projects of the user.
    *
    * @property closedProjects
    * @type ProjectModel
    * @for User
    * @private
    */
    @computed('model.projects')
    get closedProjects() {
        return (this.model.projects.filter((project) => (project.done === "1"))).length;
    }

    /**
    * Open Issues of the user.
    *
    * @property openIssues
    * @type ProjectModel
    * @for User
    * @private
    */
     @computed('issues')
     get openIssues() {
         return (this.issues.filter((issue) => (issue.issuestatus.get('done') === "0"))).length;
     }

    /**
    * Closed Projects of the user.
    *
    * @property closedIssues
    * @type ProjectModel
    * @for User
    * @private
    */
     @computed('issues')
     get closedIssues() {
         return (this.issues.filter((issue) => (issue.issuestatus.get('done') === "1"))).length;
     }     
}