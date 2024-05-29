/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Controller from '@ember/controller';

/**
 * The error controller.
 *
 * @class AppErrorController
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppErrorController extends Controller {

    /**
     * This method returns status code of the error returned from the server.
     * 
     * @method get
     * @returns string
     */
    get statusCode() {
        let statusCode = this.model.statusCode ?? '404';
        return statusCode;
    }
}
