/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

/**
 * The controller of one thread; it hands the layout controller to the template, whose actions (vote, comment, link
 * an issue) the thread component uses until the thread page issue replaces them
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.Project.Conversation
 * @extends Controller
 */
export default class AppProjectConversationPageController extends Controller {
    /**
     * The layout controller that owns the thread actions and the members of the project
     *
     * @property layout
     * @type Controller
     * @public
     */
    @tracked layout = null;
}
