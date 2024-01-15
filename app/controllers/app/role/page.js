/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoleController from 'prometheus/controllers/app/role';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

/**
 * The role page controller.
 *
 * @class AppRolePageController
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRolePageController extends AppRoleController {
    /**
     * This method update the given field's value and save the role model.
     * 
     * @param {String} fieldToEdit 
     * @param {String} value 
     * @method editRole
     */
    @action editRole(fieldToEdit) {
        let _self = this;

        if (_.isEmpty(this.message?.roleCreate?.[fieldToEdit])
            && _self.hasChanged(this.model)
            && !_self.model.isSaving) {
            _self.model.save().then(() => {
                let successMessage = htmlSafe(_self.intl.t('views.app.role.list.updated', { field: fieldToEdit }));
                new Messenger().post({
                    message: successMessage,
                    type: 'success',
                    showCloseButton: true
                });
            });
        }
    }
}